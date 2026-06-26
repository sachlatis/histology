# IstoLab Flashcards

This folder is a complete static flashcard website. Students only open the website link; they do not install or run code.

## Current card format

The Excel file uses three columns:

| image id | question | answer |
|---|---|---|

The corresponding image is stored inside `images/` and its filename begins with the same image ID.

Example:

- Excel image ID: `87822022-72f7-4ec5-b62d-3fc0bbd65711`
- Image: `images/87822022-72f7-4ec5-b62d-3fc0bbd65711.jpeg`

Supported image extensions are `.jpeg`, `.jpg`, `.png`, `.webp`, `.gif`, and `.avif`.

## Test it on your computer

Double-click `index.html`. This version uses `cards.js`, so it can also work directly from a local folder.

## Publish it with GitHub Pages

1. Extract this ZIP file.
2. Create a new GitHub repository, for example `istolab-flashcards`.
3. Upload **the contents of this folder** to the root of the repository.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
6. Save and wait for GitHub to show the public website URL.

## Adding more cards

Add the new image files to `images/`. The image filenames must match the `image id` column.

The deployed website reads its questions from `cards.js`. The included `cards.json` contains the same data in a standard format, and `istolab.xlsx` is included as the source spreadsheet.

For a new batch, provide the updated Excel file and the image folder, and the website data can be regenerated without changing the visual application.

## Included features

- Random order without repetition
- Image and question shown first
- Hidden answer revealed by button
- “Study again” and “I knew it” ratings
- Progress and score counters
- Category filtering
- Enlarged image view
- Mobile-friendly layout
- Keyboard shortcuts
