import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // Disable the default body parser
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = new formidable.IncomingForm();

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'Error parsing form data' });
            }

            const file = files.file;
            if (!file || Array.isArray(file)) {
                return res.status(400).json({ error: 'No file uploaded or multiple files not supported' });
            }

            const timestamp = Date.now();
            const filename = `${timestamp}-${file.originalFilename?.replace(/\s/g, '_')}`;

            const oldPath = file.filepath;
            const newPath = path.join(uploadsDir, filename);

            try {
                // Copy file to new location
                fs.copyFileSync(oldPath, newPath);

                // Return the URL for accessing the file
                const fileUrl = `http://localhost:3000/uploads/${filename}`;

                return res.status(200).json({
                    success: true,
                    url: fileUrl
                });
            } catch (error) {
                console.error('Error moving uploaded file:', error);
                return res.status(500).json({ error: 'Error saving file' });
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
