const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { google } = require('googleapis');

// Initialize credentials from environment variables
const credentials = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY, // Replace \\n with actual newline
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
};

// Initialize the Google Drive API client
const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

async function findFolder(idTele) {
    const query = `name='${idTele}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    try {
        console.log('Searching for folder...');
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        console.log('Search completed, result:', res.data.files);
        return res.data.files.length > 0 ? res.data.files[0] : null;
    } catch (error) {
        console.error('Error finding folder:', error);
        throw error;
    }
}

async function createAndShareFolder(req, res) {
    const idTele = req.params.idTele;

    try {
        console.log('Checking if folder already exists...');
        // Check if the folder already exists
        const existingFolder = await findFolder(idTele);
        
        if (existingFolder) {
            console.log('Folder already exists:', existingFolder.id);
            const folderUrl = `https://drive.google.com/drive/folders/${existingFolder.id}`;
            return res.json({ folderUrl });
        } else {
            console.log('Folder not found. Creating a new one...');
            // Create a new folder if it does not exist
            const folderMetadata = {
                name: idTele,
                mimeType: 'application/vnd.google-apps.folder'
            };

            const folder = await drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            console.log('New folder created:', folder.data.id);
            const folderUrl = `https://drive.google.com/drive/folders/${folder.data.id}`;

            const permissions = {
                type: 'anyone',
                role: 'writer',
                allowFileDiscovery: false
            };

            console.log('Setting folder permissions...');
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
