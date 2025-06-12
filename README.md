# Serverless AI Image Analysis Pipeline on GCP

This project is a full-stack, serverless web application that leverages Google Cloud Platform's AI and data services to analyze user-uploaded images in real-time. Users can upload an image through a polished web interface and receive an analysis of its content, including detected labels and dominant colors, powered by the Google Cloud Vision API.

**[Live Demo](https://image-processor.jaron-s.com)**

![cloud-vision-showcase](https://github.com/user-attachments/assets/33928fe6-e460-46e6-acbd-16c1a34efdb5)

## Key Features

  * **Drag-and-Drop Image Upload:** An intuitive and responsive interface for uploading images.
  * **Secure & Direct Uploads:** Uses GCS Signed URLs to upload files directly and securely from the browser to the cloud.
  * **AI-Powered Analysis:** Leverages the Google Cloud Vision API to perform label and image property detection.
  * **Real-time UI Updates:** The frontend automatically polls for processing completion and updates the view without requiring a manual refresh.
  * **Fully Serverless Backend:** The entire backend pipeline is event-driven and runs on serverless infrastructure, ensuring scalability and cost-efficiency.
  * **Robust Error Handling:** Problematic files are automatically quarantined in a separate Cloud Storage bucket for review.

## Architecture & Tech Stack

This project is built on a modern, event-driven architecture that is highly scalable and cost-effective.

**Data Flow:**

1.  A user selects an image in the **Next.js** frontend.
2.  The browser gets a secure, one-time **Signed URL** from a backend API route.
3.  The image is uploaded directly from the browser to a landing **Google Cloud Storage (GCS)** bucket.
4.  The `google.cloud.storage.object.v1.finalized` event in the GCS bucket triggers an **Eventarc** notification.
5.  Eventarc invokes a Python-based **Google Cloud Function**.
6.  The Cloud Function sends the image to the **Cloud Vision API** for analysis.
7.  The structured analysis results are saved to a **Firestore** database.
8.  The Next.js frontend, which has been polling a status API, sees the new data in Firestore and automatically refreshes the UI to display the new image and its analysis.
9.  The entire frontend is containerized with **Docker** and hosted on **Google Cloud Run** for seamless scalability.

**Technology Stack:**

| Frontend                               | Backend / Cloud                                                                                                    | Deployment / DevOps                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Next.js                                | Python 3                                                                                                           | Docker                                             |
| React                                  | Google Cloud Functions                                                                                             | Google Cloud Run                                   |
| TypeScript                             | Firestore (NoSQL Database)                                                                                         | Google Cloud Build                                 |
| Tailwind CSS                           | Google Cloud Storage                                                                                               | Google Artifact Registry                           |
| Shadcn/UI & Lucide Icons               | Google Cloud Vision API                                                                                            | GitHub (CI/CD via Netlify integration was explored, then migrated to GCP) |
|                                        | Eventarc (Event-driven triggers)                                                                                   |                                                    |

## Core Backend Logic: The Cloud Function

The heart of the automated analysis is a Python Cloud Function triggered by new file uploads. This function is responsible for orchestrating the call to the Vision API and storing the results.

`main.py`

```python
import functions_framework
from google.cloud import vision
from google.cloud import storage
from google.cloud import firestore
import os
import mimetypes

# Initialize clients to be reused across function invocations
storage_client = storage.Client()
firestore_client = firestore.Client()
vision_client = vision.ImageAnnotatorClient()

# The name of the bucket for files that fail processing
QUARANTINE_BUCKET_NAME = "js-image-quarantine" # Replace with your quarantine bucket name

@functions_framework.cloud_event
def process_image_file(cloud_event):
    """
    This function is triggered by a new file upload in a GCS bucket.
    It analyzes the image using the Vision API and stores the results in Firestore.
    """
    data = cloud_event.data
    bucket_name = data["bucket"]
    file_name = data["name"]

    print(f"Processing file: {file_name} from bucket: {bucket_name}.")

    source_bucket = storage_client.bucket(bucket_name)
    source_blob = source_bucket.blob(file_name)

    try:
        content_type = source_blob.content_type
        # If content_type is missing, guess it from the filename
        if content_type is None:
            content_type, _ = mimetypes.guess_type(file_name)
            print(f"Guessed content type: {content_type}")

        # 1. Validate that the file is an image
        if not content_type or not content_type.startswith('image/'):
            raise TypeError(f"Unsupported content type: {content_type}")

        # 2. Prepare and call the Vision API
        image_uri = f"gs://{bucket_name}/{file_name}"
        image = vision.Image(source=vision.ImageSource(image_uri=image_uri))

        features = [
            vision.Feature(type_=vision.Feature.Type.LABEL_DETECTION, max_results=10),
            vision.Feature(type_=vision.Feature.Type.IMAGE_PROPERTIES, max_results=5),
        ]
        request = vision.AnnotateImageRequest(image=image, features=features)
        response = vision_client.annotate_image(request=request)

        if response.error.message:
            raise Exception(f"Vision API Error: {response.error.message}")

        # 3. Extract and structure the data for Firestore
        labels = [label.description for label in response.label_annotations]
        colors = [
            {'red': c.color.red, 'green': c.color.green, 'blue': c.color.blue, 'score': c.score}
            for c in response.image_properties_annotation.dominant_colors.colors
        ]

        result_data = {
            "fileName": file_name,
            "fileSize": data["size"],
            "contentType": content_type,
            "detectedLabels": labels,
            "dominantColors": colors,
            "processedTimestamp": firestore.SERVER_TIMESTAMP,
        }

        # 4. Save the results to Firestore, using the filename as the document ID
        doc_ref = firestore_client.collection("images").document(file_name)
        doc_ref.set(result_data)
        print(f"Successfully analyzed {file_name} and saved to Firestore.")

    except Exception as e:
        print(f"ERROR processing {file_name}: {e}")

        # 5. Move the problematic file to the quarantine bucket
        if QUARANTINE_BUCKET_NAME:
            try:
                quarantine_bucket = storage_client.bucket(QUARANTINE_BUCKET_NAME)
                source_bucket.copy_blob(source_blob, quarantine_bucket, file_name)
                source_blob.delete()
                print(f"Moved {file_name} to quarantine bucket: {QUARANTINE_BUCKET_NAME}")
            except Exception as move_error:
                print(f"Failed to move {file_name} to quarantine: {move_error}")
        else:
            print("Quarantine bucket not configured. File not moved.")
```

## Local Development

To run this project locally, you will need Node.js, npm, and the `gcloud` CLI installed and authenticated.

1.  **Clone the repository:**

    ```bash
    git clone [your-repo-url]
    cd [your-repo-folder]
    ```

2.  **Set up GCP Credentials for Local Use:**

      * Download a **Service Account Key JSON** file from your GCP project with the required roles (`Cloud Datastore User`, `Storage Object Viewer`, `Storage Object Creator`, `Service Account Token Creator`).
      * Place it in the root of the project as `service-account-key.json`.
      * Create a local environment file by running the helper script: `node create-env.js`.
      * **Ensure `.env.local` is listed in your `.gitignore` file.**

3.  **Install dependencies and run the development server:**

    ```bash
    npm install
    npm run dev
    ```

4.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the application.
