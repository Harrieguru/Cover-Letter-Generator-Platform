import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Alert,
  Divider,
  InputAdornment,
  FormHelperText,
} from "@mui/material";

import {
  Person,
  Email,
  Phone,
  Home,
  Business,
  Work,
  Description,
  CloudUpload,
} from "@mui/icons-material";

export const CoverLetterGenerator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    hiringManagerName: "",
    hiringManagerTitle: "",
    companyName: "",
    companyAddress: "",
    positionTitle: "",
    howHeardAbout: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!file || !jobDescription.trim()) {
      alert("Please upload a resume and provide job description");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);
    formData.append("personalInfo", JSON.stringify(personalInfo));

    try {
      const response = await fetch(
        "http://localhost:5000/generate_cover_letter",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Cover_Letter.docx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        throw new Error("Failed to generate cover letter");
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Error generating cover letter. Please try again.");
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          color="primary"
          fontWeight="bold"
        >
          Cover Letter Generator
        </Typography>

        <Box component="form" noValidate sx={{ mt: 3 }}>
          {/* Personal Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                color="text.primary"
              >
                <Person sx={{ mr: 1, verticalAlign: "bottom" }} />
                Your Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3 as const}>
                <Grid item xs={12 as const} sm={6 as const}>
                  <TextField
                    fullWidth
                    required
                    name="fullName"
                    label="Full Name"
                    value={personalInfo.fullName}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12 as const} sm={6 as const}>
                  <TextField
                    fullWidth
                    required
                    type="email"
                    name="email"
                    label="Email Address"
                    value={personalInfo.email}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12 as const} sm={6 as const}>
                  <TextField
                    fullWidth
                    required
                    type="tel"
                    name="phone"
                    label="Phone Number"
                    value={personalInfo.phone}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="address"
                    label="Your Address"
                    value={personalInfo.address}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Home />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Company Information Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                color="text.primary"
              >
                <Business sx={{ mr: 1, verticalAlign: "bottom" }} />
                Company Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3 as const}>
                <Grid item xs={12 as const} sm={6 as const}>
                  <TextField
                    fullWidth
                    required
                    name="positionTitle"
                    label="Position Title"
                    placeholder="e.g., Software Engineer"
                    value={personalInfo.positionTitle}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12 as const} sm={6 as const}>
                  <TextField
                    fullWidth
                    required
                    name="companyName"
                    label="Company Name"
                    value={personalInfo.companyName}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12 as const} sm={6 as const}>
                  <TextField
                    fullWidth
                    name="hiringManagerName"
                    label="Hiring Manager Name"
                    helperText="Optional"
                    value={personalInfo.hiringManagerName}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12 as const} sm={6 as const}>
                  <TextField
                    fullWidth
                    name="hiringManagerTitle"
                    label="Hiring Manager Title"
                    helperText="Optional"
                    value={personalInfo.hiringManagerTitle}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12 as const}>
                  <TextField
                    fullWidth
                    name="companyAddress"
                    label="Company Address"
                    helperText="Optional"
                    value={personalInfo.companyAddress}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Home />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12 as const}>
                  <TextField
                    fullWidth
                    name="howHeardAbout"
                    label="How did you hear about this position?"
                    value={personalInfo.howHeardAbout}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Resume Upload Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                color="text.primary"
              >
                <Description sx={{ mr: 1, verticalAlign: "bottom" }} />
                Upload Resume
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: file ? "success.main" : "grey.400",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.3s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  accept=".doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                <CloudUpload
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  {file ? file.name : "Click to upload your resume"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accepted formats: .doc, .docx
                </Typography>
                {file && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    ✓ File selected: {file.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Job Description Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                color="text.primary"
              >
                <Description sx={{ mr: 1, verticalAlign: "bottom" }} />
                Job Description
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TextField
                fullWidth
                multiline
                rows={12}
                required
                label="Job Description"
                placeholder="Paste the complete job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                variant="outlined"
                helperText="Include all requirements, responsibilities, and qualifications"
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Box textAlign="center" sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !file || !jobDescription.trim()}
              startIcon={
                loading ? <CircularProgress size={20} /> : <CloudUpload />
              }
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              {loading ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </Box>

          {/* Instructions */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructions:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>Fill in your personal information for the header</li>
              <li>Add company details and position information</li>
              <li>Upload your resume in .doc or .docx format</li>
              <li>Paste the complete job description</li>
              <li>
                The generated cover letter will follow professional formatting
                with proper structure
              </li>
              <li>
                Your skills and experience will be matched to the job
                requirements
              </li>
            </Box>
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
};
