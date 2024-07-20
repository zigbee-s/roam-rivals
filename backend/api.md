# Event Management API

## Overview

This API provides endpoints for managing events, handling photo uploads, managing user registrations, and maintaining leaderboards.

## API Endpoints

### Event Endpoints

1. **POST /events**
   - Create a new event.
   
2. **POST /events/generate-upload-url/logo**
   - Generate a pre-signed URL for uploading event logo images.

3. **GET /events**
   - Fetch all events.

4. **GET /events/:eventId**
   - Fetch details of a specific event by its ID.

5. **PUT /events/:eventId**
   - Update details of a specific event by its ID.

6. **DELETE /events/:eventId**
   - Delete a specific event by its ID.

7. **POST /events/register**
   - Register a user for an event.

8. **GET /events/:eventId/status**
   - Get the status of a specific event (opened/closed).

9. **GET /events/:eventId/registration**
   - Check if a user is registered for a specific event.

### Photo Endpoints

10. **GET /photos/event/:eventId/themes**
    - Get themes for a specific photography event.

11. **POST /photos/event/:eventId/upload-url**
    - Generate a pre-signed URL for uploading a photo for a specific event.

12. **POST /photos/confirm-upload**
    - Confirm photo upload and save metadata.

13. **GET /photos**
    - Fetch all photos with pre-signed URLs.

14. **GET /photos/event/:eventId**
    - Fetch photos for a specific event with pre-signed URLs.

15. **POST /photos/like**
    - Like a specific photo.

16. **GET /photos/:eventId/userLikesCount**
    - Get the number of likes a user has given for a specific event.

17. **GET /photos/:eventId/userUploadedCount**
    - Get the count of photos a user has uploaded for a specific event.

### Leaderboard Endpoints

18. **GET /leaderboard**
    - Fetch the leaderboard.

### Miscellaneous Endpoints

19. **POST /photos/determine-winner/:eventId**
    - Determine the winner(s) of a specific photography event.

### New and Updated Endpoints

20. **POST /events/generate-upload-url**
    - Generate a pre-signed URL for uploading files (general endpoint).

## Usage

### Creating an Event

To create a new event, send a POST request to `/events` with the following fields:
- `title` (string, required)
- `description` (string, required)
- `startingDate` (date, required)
- `eventEndDate` (date, required)
- `location` (string, required)
- `eventType` (string, required, enum: ['general', 'quiz', 'photography'])
- Additional fields specific to the event type.

### Generating a Pre-signed URL for Event Logo

Send a POST request to `/events/generate-upload-url/logo` with the `title` of the event to receive a pre-signed URL for uploading the event logo.

### Registering for an Event

To register for an event, send a POST request to `/events/register` with the `eventId` in the request body.

### Fetching Event Details

To fetch details of a specific event, send a GET request to `/events/:eventId`.

### Fetching All Photos

To fetch all photos, send a GET request to `/photos`.

### Liking a Photo

To like a photo, send a POST request to `/photos/like` with the `photoId` in the request body.

### Fetching the Leaderboard

To fetch the leaderboard, send a GET request to `/leaderboard`.

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in case of failures. Common status codes include:
- `200 OK` for successful requests.
- `400 Bad Request` for invalid input.
- `403 Forbidden` for unauthorized actions.
- `404 Not Found` for non-existent resources.
- `500 Internal Server Error` for unexpected issues.

## Logging

The API uses a logging mechanism to record important events and errors. This helps in monitoring and troubleshooting issues.

## Contact

For any questions or support, please contact the API maintainers.

