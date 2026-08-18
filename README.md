# AgriVision AI

Build a complete, modern, responsive web application called AgriVision AI – Crop Disease Detector.

1. Project Overview

Create an AI-powered agriculture platform that helps farmers identify possible crop diseases from photographs of plant leaves.

The user should be able to:

Upload or capture a photograph of a crop leaf.

Select the crop type.

Send the image for AI analysis.

Receive a disease prediction with a confidence score.

View symptoms associated with the detected disease.

Receive practical treatment and prevention recommendations.

Save previous diagnoses.

View a dashboard showing diagnosis history and crop-health statistics.

The application should be designed for farmers and agricultural students, with a simple interface that works well on both smartphones and desktop computers.

2. Technology Requirements

Use:

React

TypeScript

Tailwind CSS

Modern component-based architecture

Supabase for authentication and database storage

Responsive design

AI image-analysis integration through a secure server-side API/edge function

Environment variables for all API keys and secrets

Do NOT expose API keys or secret credentials in frontend code.

Create clean, maintainable and well-commented code.

3. Application Pages

Create the following pages:

A. Landing Page

Create a professional agriculture-themed landing page.

Hero section:

Headline:
"Detect Crop Diseases with AI"

Subheading:
"Upload a photo of a crop leaf and get an AI-powered assessment, possible disease identification, and practical recommendations."

Primary button:

"Analyze a Crop"

Secondary button:

"View Dashboard"

Include sections for:

How It Works

Supported Crops

Benefits

AI Analysis

Farmer Dashboard

Call to Action

Use high-quality agricultural imagery and a clean, trustworthy visual style.

4. Authentication

Implement:

Sign up

Login

Logout

Forgot password

User profile

Use Supabase Authentication.

Users should only be able to see their own diagnosis history.

5. Crop Analysis Page

Create the main AI diagnosis interface.

The page should contain:

Crop Selection

Dropdown:

Tomato

Potato

Maize

Cassava

Beans

Banana

Rice

Wheat

Other

Image Upload

Allow users to:

Drag and drop an image

Browse for an image

Capture/upload an image from a mobile device

Supported formats:

JPG

JPEG

PNG

WEBP

Display a preview before analysis.

Add validation for:

Invalid file type

File too large

Missing image

Poor/unsupported input

Maximum image size: 10 MB.

Analyze Button

Button:

"Analyze with AI"

Show an animated loading state while analysis is occurring.

Example:

"AI is examining your crop..."

6. AI Analysis

Create a secure backend/edge function that receives the uploaded image and crop type.

The AI should analyze:

Visible leaf symptoms

Spots

Discoloration

Lesions

Wilting

Mold-like patterns

Pest damage

Other visible abnormalities

Return structured JSON similar to:

{
"crop": "Tomato",
"diagnosis": "Early Blight",
"confidence": 0.94,
"severity": "Moderate",
"symptoms": [
"Dark circular spots",
"Yellowing around lesions",
"Lower leaves affected"
],
"recommendations": [
"Remove heavily infected leaves",
"Improve air circulation",
"Avoid overhead watering"
],
"prevention": [
"Rotate crops",
"Remove infected plant material",
"Maintain appropriate plant spacing"
]
}

IMPORTANT:

Do not present AI predictions as guaranteed medical/agricultural facts.

Clearly label the result:

"AI-generated assessment — not a definitive agricultural diagnosis."

If the image quality is insufficient, the AI should return:

"Unable to confidently analyze this image. Please upload a clear photograph showing the affected part of the plant."

Do not force a disease prediction when confidence is low.

7. Results Page

After analysis, display a professional results dashboard.

Example:

AI Crop Health Assessment

Crop:
Tomato

Possible Disease:
Early Blight

Confidence:
94%

Severity:
Moderate

Symptoms Detected

Show symptoms as cards.

Recommended Actions

Display practical recommendations.

Prevention

Display prevention advice.

AI Confidence

Create a visual confidence indicator.

For example:

94%

Use a progress bar or circular indicator.

Important Notice

Display:

"AI-generated assessment. Results should be confirmed by a qualified agricultural professional before making significant treatment decisions."

Buttons:

Save Diagnosis

Analyze Another Image

View History

8. Dashboard

Create a farmer-friendly dashboard.

Display:

Statistics

Total Analyses

Healthy Crops

Possible Diseases

High-Risk Cases

Create charts showing:

Diagnoses over time

Disease frequency

Crop health distribution

Create a "Recent Analyses" table containing:

Date

Crop

Diagnosis

Confidence

Severity

Status

View button

9. Diagnosis History

Create a page where users can view all previous analyses.

Allow:

Search

Filter by crop

Filter by disease

Filter by severity

Sort by date

Clicking a diagnosis should open the complete analysis.

Allow users to delete their own diagnosis records.

10. Database

Use Supabase.

Create appropriate tables such as:

profiles

Fields:

id

full_name

email

location

created_at

diagnoses

Fields:

id

user_id

crop_type

image_url

diagnosis

confidence

severity

symptoms

recommendations

prevention

created_at

Use appropriate relationships and Row Level Security.

Users must only be able to access their own diagnosis records.

11. Image Storage

Use Supabase Storage for uploaded crop images.

Create a secure storage bucket.

Do not store images permanently in the browser.

Associate uploaded images with the user's diagnosis record.

12. AI Integration Architecture

Structure the application like this:

User
↓
React Frontend
↓
Supabase Storage
↓
Secure Edge Function
↓
AI Vision API
↓
Structured Diagnosis
↓
Supabase Database
↓
Dashboard

Keep AI API credentials server-side.

Create the AI integration in a way that allows the model/API provider to be changed later without rebuilding the frontend.

Use environment variables.

13. AI Prompt

Create a carefully structured system prompt for the image-analysis model.

The AI should behave as an agricultural crop-health assistant.

It should:

Analyze only visible evidence.

Avoid pretending to know information that cannot be seen.

Identify the most likely disease when sufficient evidence exists.

Provide confidence.

Explain visible symptoms.

Recommend general management steps.

State when professional confirmation is recommended.

Avoid dangerous or highly specific chemical instructions.

Ask for a clearer image when the image is inadequate.

Return structured JSON.

The AI response must be machine-readable.

14. Low Confidence Handling

Implement confidence thresholds.

For example:

80–100%

Display:

"High-confidence AI assessment"

60–79%

Display:

"Moderate-confidence AI assessment"

Below 60%

Display:

"Low-confidence assessment"

and recommend uploading another image.

Do not display a disease as certain when confidence is low.

15. Navigation

Create a navigation bar containing:

Home

Analyze

Dashboard

History

About

Profile

On mobile, use a responsive hamburger/bottom navigation system.

16. Design Requirements

Use a professional agricultural technology aesthetic.

Style:

Clean

Modern

Trustworthy

Accessible

Minimal

Mobile-first

Use agricultural-inspired colors such as:

Green

White

Earth tones

Soft neutral backgrounds

Use rounded cards, subtle shadows and clear typography.

Do not make the interface look like a generic AI chatbot.

The primary purpose should immediately be obvious:

Upload a crop image → Analyze → Understand the problem → Take action.

17. Accessibility

Implement:

Proper semantic HTML

Accessible buttons

Keyboard navigation

Alt text for images

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/93c794cb-c1d2-48f9-9850-66a39c78b32f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
