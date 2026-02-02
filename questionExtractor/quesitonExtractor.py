import fitz  # PyMuPDF

def extract_left_column_text(pdf_path, start_page=5, end_page=10, left_ratio=0.4):
    """
    Extract text from the left side of pages in a PDF.
    
    Args:
    - pdf_path (str): Path to the PDF file.
    - start_page (int): Starting page number (1-based).
    - end_page (int): Ending page number (inclusive, 1-based).
    - left_ratio (float): Fraction of page width considered as the left side (default 40%).
    
    Returns:
    - dict: keys are page numbers, values are extracted text strings.
    """
    doc = fitz.open(pdf_path)
    extracted_text = {}

    for page_num in range(start_page - 1, end_page):  # 0-based index
        page = doc.load_page(page_num)
        page_width = page.rect.width

        # Get all text blocks with their bbox
        blocks = page.get_text("blocks")
        left_side_texts = []

        for block in blocks:
            x0, y0, x1, y1, text, block_no, block_type = block
            # Check if the block is mostly in the left part of the page
            if x1 <= page_width * left_ratio:
                left_side_texts.append(text.strip())

        extracted_text[page_num + 1] = "\n".join(left_side_texts)

    return extracted_text


if __name__ == "__main__":
    pdf_file = "sample.pdf"  # Replace with your file name
    left_text = extract_left_column_text(pdf_file, 5, 10)

    for page, text in left_text.items():
        print(f"\n--- Page {page} ---\n{text}\n")
