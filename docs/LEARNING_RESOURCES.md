# Learning Resources Architecture

## Overview
This document describes the implementation of Learning Resources within the Skillora application, specifically covering how resources are handled across both Android and Web platforms to ensure compatibility.

## 1. Resource Firestore Structure
A Skill document in Firestore contains a `roadmap` array. Each element in this array represents a `RoadmapDay`.
Each `RoadmapDay` contains lists of resources:
- `fileResources`: `List<ResourceLink>`
- `videoResources`: `List<ResourceLink>`

A `ResourceLink` has the following schema:
```json
{
  "id": "UUID string",
  "title": "String title",
  "url": "String URL"
}
```

## 2. Resource Storage Structure
Resources (PDFs, images, videos) are uploaded to Firebase Storage. Once uploaded, a public or authenticated download URL is generated for the file.

## 3. Resource Field Names
The canonical field holding the resource link is `url` inside the `ResourceLink` object. This `url` field contains a fully resolved download URL (e.g., `https://firebasestorage.googleapis.com/...`), not a relative `gs://` path.

## 4. Resource Types
Currently, the system supports:
- File resources (documents, PDFs, etc.)
- Video resources

These are separated in the `RoadmapDay` model into `fileResources` and `videoResources`.

## 5. How Web gets the resource URL
The Web app (`Skillora_Web`) reads the `url` field directly from the `ResourceLink` object within the fetched `Skill` document from Firestore. There is no need to manually call `getDownloadURL()` on the client side since the URL is already fully resolved when it was saved during the upload process.

## 6. How Web opens/downloads it
When a user clicks on a resource in the Learning page, the Web application uses:
```javascript
window.open(res.url, '_blank', 'noopener,noreferrer');
```
This opens the resource safely in a new browser tab, matching the behavior of the Android app which uses `Intent(Intent.ACTION_VIEW, Uri.parse(res.url))`.

## 7. Authentication Requirements
Because the `url` is a standard Firebase Storage download URL, access control is handled by the token included in the URL itself (if generated that way) or by Firebase Storage Rules if the URL is requested by the client. Since the URL is stored directly, any valid download URL will work.

## 8. Storage Security
Firebase Storage rules govern the underlying files. The Web application simply follows the URL provided by Firestore.

## 9. Android Compatibility
The Web implementation is 100% compatible with Android:
- Android stores download URLs directly in the `url` field.
- Android uses `Intent.ACTION_VIEW` to open these external URLs in the browser or an appropriate external app.
- Web uses `window.open` to achieve the exact same behavior (opening the URL in a new tab).

## 10. Error Handling
If a resource does not have a valid URL (e.g., `res.url` is empty), the click handler safely ignores the action, preventing empty tabs from opening.
