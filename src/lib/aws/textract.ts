import {
  TextractClient,
  DetectDocumentTextCommand
} from '@aws-sdk/client-textract'

const textractClient = new TextractClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)

    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: bytes
      }
    })

    const response = await textractClient.send(command)

    const extractedText = response.Blocks?.filter(
      block => block.BlockType === 'LINE'
    )
      .map(block => block.Text)
      .join('\n')

    return extractedText || ''
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return await file.text()
  } else if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file)
  } else {
    throw new Error('Unsupported file type')
  }
}
