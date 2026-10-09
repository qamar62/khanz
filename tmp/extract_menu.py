from pypdf import PdfReader

reader = PdfReader(r"E:\Code\khanz\KHANZ - August 2026.pdf")
for index, page in enumerate(reader.pages, start=1):
    print(f"\n=== PAGE {index} ===")
    print(page.extract_text() or "[NO TEXT]")
