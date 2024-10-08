import sys

from bs4 import BeautifulSoup, Comment

PAGES_DIR = 'pages'

class PageCleaner:
	def __init__(self, page):
		self.page = page

		self.tags_to_remove = ['script', 'style', 'link', 'meta', 'noscript', 'iframe', 'svg']
		self.path = f'{PAGES_DIR}/{self.page}.html'
		self.files_folder = f'{PAGES_DIR}/{self.page}_files'

		self.html = self.read_page()

	def read_page(self):
		with open(self.path, 'r') as f:
			return f.read()

	def clean_page(self):
		soup = BeautifulSoup(self.html, 'lxml')

		# Remove tags
		for tag in self.tags_to_remove:
			for elem in soup(tag):
				print(f'Removing {tag} tag')
				elem.decompose()

		# Remove comments
		for elem in soup(text=lambda text: isinstance(text, Comment)):
			print('Removing comment')
			elem.extract()

		# Remove attributes from tag <html>
		for attr in ['class', 'id', 'style']:
			del soup.html[attr]

		self.result = str(soup)

	def save_page(self):
		with open(self.path, 'w') as f:
			f.write(self.result)

		print(f'Page saved as {page}.html')

	def delete_files_folder(self):
		import os
		import shutil

		if os.path.exists(self.files_folder):
			shutil.rmtree(self.files_folder)

			print(f'Folder {self.files_folder} deleted')	


if __name__ == '__main__':
	if len(sys.argv) < 2:
		print('Usage: python clean_page.py <filename>')
		sys.exit(1)

	page = sys.argv[1]
	with open(f'{PAGES_DIR}/{page}.html', 'r') as f:
		html = f.read()

	cleaner = PageCleaner(page)
	cleaner.clean_page()
	cleaner.save_page()
	cleaner.delete_files_folder()
	