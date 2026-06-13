# Knowledge Hub Exam Library

Static GitHub Pages library for ChMLTech practice exams.

Live site: https://quakfoolee-dotcom.github.io/exam-library/

## How to Use

1. Open the live site.
2. Search by topic, skill, credential, or exam name.
3. Use the category filters to narrow the catalog.
4. Select `Open exam` to launch an exam in a new tab.
5. Use each exam's built-in modes, scoring, explanations, and certificate tools where available.

## Repository Structure

- `index.html` is the public exam library page.
- Each exam is a standalone `.html` file in the repository root.
- `.nojekyll` keeps GitHub Pages from applying Jekyll processing.

## Adding a New Exam

1. Add the new exam HTML file to the repository root.
2. Open `index.html`.
3. Add a new exam entry to the correct category in the `categories` array.
4. Use the exact filename in the entry so the generated link resolves correctly.
5. Check that the file exists and the catalog link opens locally.
6. Commit and push to `main`.

Example catalog entry:

```js
['Exam Title','Exam_File_Name.html','100Q','V1','Short description of the exam.']
```

## Publishing

GitHub Pages publishes from the `main` branch. After changes are pushed, the live site may take a short time to refresh.

Recommended commands:

```bash
git status
git add index.html New_Exam_File.html
git commit -m "Add new exam"
git push origin main
```

## Link Pattern

The catalog builds public links using this base URL:

```js
https://quakfoolee-dotcom.github.io/exam-library/
```

Keep filenames URL-safe and avoid renaming published exam files unless the catalog is updated at the same time.
