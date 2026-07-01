# Health Self-Check Kiosk

A walk-in, self-service web app that lets a student or employee enter their
name, age, sex, weight, and height, then instantly computes their BMI,
classifies it into a health category, and shows a tailored recommendation.
Every submission is also logged to a shared Google Sheet so the school nurse
or HR office can review usage and follow up with at-risk individuals.

Built for **Laboratory 5: Building a Responsive Health Self-Check Web
Application** — DLSU-D College of Information and Computer Studies,
Information Technology Department.

## The Problem

Many students and employees on campus have no quick, private way to check
their BMI without visiting the clinic in person. This kiosk gives them an
immediate answer and a simple recommendation, while quietly recording the
visit for staff to monitor.

## Features

- Responsive, card-style layout (desktop, tablet, and mobile) built with
  semantic HTML and CSS, including a media query that stacks the form
  fields vertically on small screens.
- Client-side validation with clear inline error messages per field.
- BMI calculation, category classification, and a color-coded result card.
- A running list of the current session's submissions.
- Submissions are sent to a Google Apps Script Web App, which appends each
  one as a new row in a connected Google Sheet.

## JavaScript Control Structures Used

- **if-else / else-if** — validates each required field (empty, non-numeric,
  or out-of-range values) before the form is allowed to submit.
- **switch-case** — maps the computed BMI value to a category (Underweight,
  Normal, Overweight, Obese), its recommendation message, and its result
  color.
- **loop (for...of / forEach)** — validates every required field in a single
  pass using the `REQUIRED_FIELDS` array, and renders the running list of
  session submissions.

## How to Run

1. Clone or download this repository.
2. Open `index.html` in a browser — no build step or server required.
3. To enable Google Sheets recording, follow the setup notes at the top of
   `apps-script.gs`, then paste your deployed Web App URL into the
   `WEB_APP_URL` constant near the top of `script.js`.

## Live Demo

_(Add your GitHub Pages link here after publishing, e.g.
`https://patdyeyms.github.io/Wellness-Kiosk/`)_

## Project Structure

```
health-checker-kiosk/
├── index.html      Main page structure and form
├── style.css        Styling, layout, and responsive rules
├── script.js         Validation, BMI logic, and history rendering
├── apps-script.gs   Backend code for the Google Apps Script Web App
└── README.md
```
