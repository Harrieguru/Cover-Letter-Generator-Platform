from flask import Flask, request, send_file
from flask_cors import CORS
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from io import BytesIO
import cohere

load_dotenv()

# Configure Cohere
COHERE_API_KEY = os.getenv("COHERE_API_KEY") 
co = cohere.Client(COHERE_API_KEY)
MODEL_NAME = "command-a-03-2025"  # you can also try "command-r-plus"

app = Flask(__name__)
CORS(app)

@app.route("/improve_resume", methods=["POST"])
def improve_resume():
    try:
        file = request.files.get("file")
        job_desc = request.form.get("jobDescription", "")

        if not file:
            return {"error": "No file uploaded"}, 400

        # Read Word document
        doc = Document(file)
        resume_text = "\n".join([p.text for p in doc.paragraphs])

        # Prompt
        prompt = f"""Improve and rewrite this resume for the following job:

Job Description: 
{job_desc}

Current Resume:
{resume_text}

Please provide an improved version that:
1. Better aligns with the job requirements
2. Uses strong action verbs
3. Quantifies achievements where possible
4. Maintains professional formatting
5. Highlights relevant skills and experience

Return only the improved resume content."""

        try:
            response = co.chat(
                model=MODEL_NAME,
                message=prompt
            )
            improved_text = response.text
        except Exception as e:
            print(f"Error generating content: {e}")
            return {"error": "Failed to generate improved resume"}, 500

        # Create new Word document
        out_doc = Document()
        for line in improved_text.split("\n"):
            if line.strip():
                out_doc.add_paragraph(line.strip())
        
        byte_io = BytesIO()
        out_doc.save(byte_io)
        byte_io.seek(0)

        return send_file(
            byte_io,
            download_name="Improved_Resume.docx",
            as_attachment=True,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    
    except Exception as e:
        print(f"Error in improve_resume: {e}")
        return {"error": "Internal server error"}, 500


@app.route("/generate_cover_letter", methods=["POST"])
def generate_cover_letter():
    try:
        file = request.files.get("file")
        job_desc = request.form.get("jobDescription", "")
        personal_info_str = request.form.get("personalInfo", "{}")
        
        if not file:
            return {"error": "No resume file uploaded"}, 400
        if not job_desc.strip():
            return {"error": "No job description provided"}, 400
        
        try:
            personal_info = json.loads(personal_info_str)
        except json.JSONDecodeError:
            personal_info = {}

        # Read resume
        doc = Document(file)
        resume_text = "\n".join([p.text for p in doc.paragraphs])

        position_title = personal_info.get('positionTitle', '').strip() or "the position"

        prompt = f"""Create a professional cover letter for the {position_title} position. Based on the following information:
        
Job Description: 
{job_desc}

Resume Content: 
{resume_text}

Instructions:
1. Write ONLY the body content of the cover letter (no header, no contact information, no date)
2. Start with "Dear [Hiring Manager Name]," or "Dear Hiring Manager," 
3. Write 3-4 paragraphs:
   - Opening: Express interest in the specific position 
   - Body (1-2 paragraphs): Highlight relevant skills and experiences from the resume that match job requirements with specific examples
   - Closing: Express enthusiasm, mention next steps, and thank them
4. End with "Sincerely," followed by a blank line for signature
5. Use professional but engaging language
6. Do NOT include any placeholder brackets like [Your Name] or contact information
7. Do NOT include any header information, addresses, or dates
8. Focus on connecting resume experience to job requirements
9. keep it brief and concise but om depth enough to cover all the important aspects of an effective cover letter
10. make it 2 paragraphs max (keep it simple!)

Additional context:
- Company: {personal_info.get('companyName', 'your company')}
- How heard about position: {personal_info.get('howHeardAbout', 'through your website')}"""

        try:
            response = co.chat(
                model=MODEL_NAME,
                message=prompt
            )
            cover_letter_content = response.text.strip()
        except Exception as e:
            print(f"Error generating cover letter content: {e}")
            return {"error": "Failed to generate cover letter"}, 500

        # Build Word document
        doc = Document()
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(1)
            section.bottom_margin = Inches(1)
            section.left_margin = Inches(1)
            section.right_margin = Inches(1)

        if personal_info.get('fullName'):
            name_para = doc.add_paragraph(personal_info['fullName'])
            name_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in name_para.runs:
                run.bold = True
        
        contact_info = []
        if personal_info.get('address'):
            contact_info.append(personal_info['address'])
        if personal_info.get('phone') and personal_info.get('email'):
            contact_info.append(f"{personal_info['phone']} | {personal_info['email']}")
        elif personal_info.get('phone'):
            contact_info.append(personal_info['phone'])
        elif personal_info.get('email'):
            contact_info.append(personal_info['email'])
        
        for info in contact_info:
            p = doc.add_paragraph(info)
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        
        doc.add_paragraph()
        date_p = doc.add_paragraph(datetime.now().strftime("%B %d, %Y"))
        date_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        doc.add_paragraph()

        recipient_added = False
        for field in ["hiringManagerName", "hiringManagerTitle", "companyName", "companyAddress"]:
            if personal_info.get(field):
                doc.add_paragraph(personal_info[field])
                recipient_added = True
        if recipient_added:
            doc.add_paragraph()

        # Process AI-generated content
        lines = cover_letter_content.split("\n")
        processed_lines = []
        for line in lines:
            line = line.strip()
            if line:
                if line.startswith('Dear ') and '[Hiring Manager Name]' in line:
                    if personal_info.get('hiringManagerName'):
                        line = f"Dear {personal_info['hiringManagerName']},"
                    else:
                        line = "Dear Hiring Manager,"
                processed_lines.append(line)
        
        for line in processed_lines:
            para = doc.add_paragraph(line)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            if line.endswith(',') and (line.startswith('Dear ') or line == 'Sincerely,'):
                doc.add_paragraph()
        
        byte_io = BytesIO()
        doc.save(byte_io)
        byte_io.seek(0)

        return send_file(
            byte_io,
            download_name="Cover_Letter.docx",
            as_attachment=True,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    
    except Exception as e:
        print(f"Error in generate_cover_letter: {e}")
        return {"error": "Internal server error"}, 500


@app.route("/health", methods=["GET"])
def health_check():
    return {"status": "healthy", "model": MODEL_NAME}


if __name__ == "__main__":
    print("Starting Flask server...")
    print(f"Using Cohere key: {'✓ Set' if COHERE_API_KEY else '✗ Missing'}")
    app.run(debug=True, port=5000)
