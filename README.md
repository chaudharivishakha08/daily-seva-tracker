# Shri Swami Samarth - Seva Poll App

This project now uses Firebase Cloud Firestore for shared storage, so all users can see the same students and responses.

## Files

```text
seva-tracker/
|-- add-student.html
|-- config.js
|-- daily.html
|-- firebase-client.js
|-- index.html
|-- poll.html
|-- results.html
|-- style.css
`-- README.md
```

## Firebase setup

1. Create a Firebase project in the Firebase console.
2. Add a Web app to that project.
3. Enable Cloud Firestore.
4. Copy your Firebase web app config and paste it into [config.js](/C:/Users/Vishakha/OneDrive/Desktop/seva-tracker/config.js).

Official docs used:
- [Add Firebase to your JavaScript project](https://firebase.google.com/docs/web/setup)
- [Alternative ways to add Firebase to your JavaScript project](https://firebase.google.com/docs/web/alt-setup)
- [Get started with Cloud Firestore](https://firebase.google.com/docs/firestore/quickstart)

## Firestore data model

- Document: `app/metadata`
  - field: `extraStudents` array
- Collection: `responses`
  - one document per student per date
  - fields: `date`, `studentName`, `question`, `selectedOption`, `optionText`, `timestamp`

## Suggested Firestore rules for initial testing

Use test mode only while setting up. After that, lock it down.

For quick setup, you can start with:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Hosting

This is now a static app, so you can host it for free on services like GitHub Pages, Firebase Hosting, Netlify, or Vercel.

## Important

- `config.js` must contain your real Firebase config.
- Firestore must be enabled in your Firebase project.
- For production, update Firestore security rules instead of leaving them open.
