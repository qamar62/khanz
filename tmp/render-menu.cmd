@echo off
if not exist "tmp\pdfs\menu-data" mkdir "tmp\pdfs\menu-data"
"C:\Users\QAM\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe" -jpeg -r 150 "KHANZ - August 2026.pdf" "tmp\pdfs\menu-data\page"
