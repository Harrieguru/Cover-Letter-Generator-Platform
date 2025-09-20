from flask import Flask, request, send_file
from flask_cors import CORS
import google.generativeai as genai
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.shared import OxmlElement, qn
from io import BytesIO

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
CORS(app)

model = genai.GenerativeModel("gemini-1.5-flash")

@app.route("/improve_resume", methods=["POST"])
def improve_resume():
    file = request.files.get("file")
    job_desc = request.form.get("jobDescription", "")

    # Read Word document
    doc = Document(file)
    resume_text = "\n".join([p.text for p in doc.paragraphs])

    # Send to Gemini API
    chat = model.start_chat(history=[])
    prompt = f"Improve and rewrite this resume for the following job:\nJob Description: {job_desc}\nResume:\n{resume_text}"
    response = chat.send_message(prompt)
    improved_text = response.text

    # Create new Word document
    out_doc = Document()
    for line in improved_text.split("\n"):
        out_doc.add_paragraph(line)
    byte_io = BytesIO()
    out_doc.save(byte_io)
    byte_io.seek(0)

    return send_file(
        byte_io,
        download_name="Improved_Resume.docx",
        as_attachment=True,
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@app.route("/generate_cover_letter", methods=["POST"])
def generate_cover_letter():
    file = request.files.get("file")
    job_desc = request.form.get("jobDescription", "")
    personal_info_str = request.form.get("personalInfo", "{}")
    
    try:
        personal_info = json.loads(personal_info_str)
    except json.JSONDecodeError:
        personal_info = {}

    # Read resume
    doc = Document(file)
    resume_text = "\n".join([p.text for p in doc.paragraphs])

    # Extract position title from form or job description
    position_title = personal_info.get('positionTitle', '').strip()
    if not position_title:
        # Try to extract from job description if not provided
        position_title = "the position"

    # Create comprehensive prompt for cover letter
    prompt = f"""
    Create a professional cover letter for the {position_title} position. Based on the following information:
    
    Job Description: {job_desc}
    
    Resume Content: {resume_text}
    
    Instructions:
    1. Write ONLY the body content of the cover letter (no header, no contact information, no date)
    2. Start with "Dear [Hiring Manager Name]," or "Dear Hiring Manager," 
    3. Write 3-4 paragraphs:
       - Opening: Express interest in the specific position and mention how you heard about it
       - Body (1-2 paragraphs): Highlight relevant skills and experiences from the resume that match job requirements with specific examples
       - Closing: Express enthusiasm, mention next steps, and thank them
    4. End with "Sincerely," followed by a blank line for signature
    5. Use professional but engaging language
    6. Do NOT include any placeholder brackets like [Your Name] or contact information
    7. Do NOT include any header information, addresses, or dates
    8. Focus on connecting resume experience to job requirements
    
    Additional context:
    - Company: {personal_info.get('companyName', 'your company')}
    - How heard about position: {personal_info.get('howHeardAbout', 'through your website')}
    """

    # Send to Gemini API
    chat = model.start_chat(history=[])
    response = chat.send_message(prompt)
    cover_letter_content = response.text.strip()

    # Create formatted Word document
    doc = Document()
    
    # Set document margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Add your contact information at the top
    if personal_info.get('fullName'):
        name_para = doc.add_paragraph(personal_info['fullName'])
        name_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
        # Make name bold
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
    
    # Add spacing after your info
    doc.add_paragraph()
    
    # Add date
    date_p = doc.add_paragraph(datetime.now().strftime("%B %d, %Y"))
    date_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    # Add spacing
    doc.add_paragraph()
    
    # Add recipient information if provided
    recipient_added = False
    if personal_info.get('hiringManagerName'):
        doc.add_paragraph(personal_info['hiringManagerName'])
        recipient_added = True
    if personal_info.get('hiringManagerTitle'):
        doc.add_paragraph(personal_info['hiringManagerTitle'])
        recipient_added = True
    if personal_info.get('companyName'):
        doc.add_paragraph(personal_info['companyName'])
        recipient_added = True
    if personal_info.get('companyAddress'):
        doc.add_paragraph(personal_info['companyAddress'])
        recipient_added = True
    
    if recipient_added:
        doc.add_paragraph()
    
    # Process the AI-generated content and add to document
    # Handle the greeting properly
    lines = cover_letter_content.split('\n')
    
    # Replace placeholder in greeting if hiring manager name is provided
    processed_lines = []
    for line in lines:
        line = line.strip()
        if line:
            # Handle the greeting line
            if line.startswith('Dear ') and '[Hiring Manager Name]' in line:
                if personal_info.get('hiringManagerName'):
                    line = f"Dear {personal_info['hiringManagerName']},"
                else:
                    line = "Dear Hiring Manager,"
            processed_lines.append(line)
    
    # Add the processed content to the document
    for line in processed_lines:
        if line.strip():
            para = doc.add_paragraph(line)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            
            # Add extra spacing after greeting and before signature
            if line.endswith(',') and (line.startswith('Dear ') or line == 'Sincerely,'):
                doc.add_paragraph()
    
    # Save to BytesIO
    byte_io = BytesIO()
    doc.save(byte_io)
    byte_io.seek(0)

    return send_file(
        byte_io,
        download_name="Cover_Letter.docx",
        as_attachment=True,
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

if __name__ == "__main__":
    app.run(debug=True)