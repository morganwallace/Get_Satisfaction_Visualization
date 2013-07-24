#!usr/bin/python
import os
import re

scriptRegex=re.compile('src=(?:\"|\')(.*?js)')
cssRegex = re.compile('href=(?:\"|\')(.*?css)')
externalFiles = {}

def getScript(scriptName):
	f=open(scriptName,"r")
	scriptContent=f.read()
	f.close()
	return scriptContent

def compile(sourceFile="index.html"):
	f=open(sourceFile,"r")
	htmlContent=f.read()
	f.close()
	print(htmlContent)
	scripts = re.findall(scriptRegex,htmlContent)
	cssNames = re.findall(cssRegex,htmlContent)
	for script in scripts:
		externalFiles[script]=htmlContent.find(script)
	for css in cssNames:
		externalFiles[css]=htmlContent.find(css)
	print externalFiles
	for extFile in externalFiles:
		ef=open(extFile,'r')
		extFileContent = ef.read()
		ef.close()
		addedCharacters=len(extFileContent)
		insertPos = htmlContent.find(">",externalFiles[extFile])+1
		htmlContent = htmlContent[:insertPos]+extFileContent+htmlContent[insertPos:]
		for i in externalFiles:
			if insertPos< externalFiles[i]:
				externalFiles[i]+=addedCharacters
	saveFile=open(sourceFile[:-5]+"_compiled.html","w")
	saveFile.write(htmlContent)
	saveFile.close()



def main():
	compile()

if __name__ == '__main__':
	main()
