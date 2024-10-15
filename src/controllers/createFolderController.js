const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Path to your Service Account credentials
const credentialsPath = path.join(__dirname, '..', 'config', 'credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Initialize the Google Drive API client
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

async function findFolder(idTele) {
    const query = `name='${idTele}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    try {
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        
        return res.data.files.length > 0 ? res.data.files[0] : null;
    } catch (error) {
        console.error('Error finding folder:', error);
        throw error;
    }
}

async function createAndShareFolder(req, res) {
    const idTele = req.params.idTele;

    try {
        // Check if the folder already exists
        const existingFolder = await findFolder(idTele);
        
        if (existingFolder) {
            console.log('Folder already exists:', existingFolder.id);
            
            const folderUrl = `https://drive.google.com/drive/folders/${existingFolder.id}`;
            return res.json({ folderUrl });
        } else {
            // Create a new folder if it does not exist
            const folderMetadata = {
                name: idTele,
                mimeType: 'application/vnd.google-apps.folder'
            };

            const folder = await drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            const folderUrl = `https://drive.google.com/drive/folders/${folder.data.id}`;
            console.log('Folder created successfully:', folder.data.id);

            const permissions = {
                type: 'anyone',
                role: 'writer',
                allowFileDiscovery: false
            };

            await drive.permissions.create({
                fileId: folder.data.id,
                resource: permissions
            });

            console.log('Folder shared successfully');
            return res.json({ folderUrl });
        }
    } catch (error) {
        console.error('Error creating or sharing folder:', error);
        res.status(500).send('Failed to create or share folder');
    }
}


module.exports = { createAndShareFolder, findFolder };
