const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { google } = require('googleapis');

// Initialize credentials
const credentials = {
    type: "service_account",
    project_id: "interviewtelkom",
    private_key_id: "f16ffab6d6a724cd593e42aafe535f1c61302cec",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6ekVQ+zWw1Iup\nm7XYA4tjPs4EXKbEL3K9X3YGooYBCSmePEYl9TdpYSQUeV7bYe2m7aUJkzoEFppR\n0kSxVBnDwA6GfHLc531tnMNk4CV8XbD7Z8wmTRZ49KIoYuiA129Dx6tOj54OWnV8\nJNwWX+6FSY8n/YH08j4scSyOsx6lYNg8fwvkUzg3MP93ZPulQOaaJSziDnwCQE8B\n+c41ZFO7kL4hY2zwf3m2U1C00lJWvYLshMmyM7Ziak9wcins+qD9knhLU2CeC3ot\nG/7L9sLOxDHBuQTIxLW3+PcLF85mNgkvjfob7P4Gv+ZNzfKBIX1NucYBYlrFpT3+\nMmikdpW7AgMBAAECggEAOiR5jGBnQzViPoXwUuP4B//DGJUS4kSxD9693B+8jIIg\n2deNP7SPjGnfaArXyqtkABJEzRF8m124zB41kNzaE7DEVqZi4gHDl/Oy8Lb6uSY1\nUo3wl1id0yTjkpgUSmfhp06QWTRqYatOymBrxwYuRpzC6AMhDBCj1hOLgwrSWVmo\n/3jQ2+ubeWy1nIj68PBrQUlCuke35BBcTryu+cTCNlydxmHXCubUTR/L0w26GwQX\npMCBBYcoEo6clZV2rjBSe94rLOFofuVkBT+u4uYcKXOaFA61Ll1zbz9GWh9CH52f\nCucQFsYoW9K93OSTrXEMViyiJ1e8ebwSDRIdrMERsQKBgQD+UcZK+yEjyhpyQrAY\nker/y+orLjxIzXOG88TrvLEp8+z7P+0J4b6BwU0RuG0IR/rpgj6o7DA5jx4Va09P\n6m36+zAmtCCoTcujcxhXzHv2LAXsnKsbfK7v4RgokyzrKJWQNOF2xCv1t/b1mvrS\npc02s6Uso4xKFLSvph1mFK5SjwKBgQC7tbrhEu78la1NXzg9FCU2/UecGt86JkoI\nfIrBkSIQAgkWTjyQc0f7Vx5WmnTPRcgAz9M/cSVRjojmDdR/T4J+BGFg6XNZEhx5\nDuida082lEOADmsuKdmqUZ62jBe8PgGB3hvAIaEfIl8U1ZJ/RVVOTcwIMNYkhG7R\nOuOwneEwFQKBgEUI8ajc7qwGapNlouOoiIATXGeIT3j7vEZ/2Y6cVAMtYcD6I2Ax\nVUNns4IB7Cb5UxUb8+Jq6tRVEzeBP7BT1LLyiKmY79x/8a1Wyt7adTPn01vdU11M\nxTf8hFBPUzwqch8JG8LfkYdL/s/A2CFiPIiCz22En8pkQIAFualCJ+flAoGAVXv/\nrXzH5bPshq30mKxR/mb+c7MxMfQ6Bv9g2aJU1uF2bfgXUNmPUIFuSZZx1+s5mFUN\nKXlHu4qkAdEOkyQMk4M/LbljVI8Q9Hi7quUx3/NJgkoOualJfW1KUGwgaxP578DM\n9oTaMamfj4dr/hX/MXfwkVJcU6kUJqkhBFACO7kCgYEAgZPhW9czhKPA4DzZk0AR\nmbYSRuhDxA44Da15ViLWm5REprcw/cFy6a/TZj3wAtJ/a2ZHv9ymIfsoIZtKLvHo\n6QhfGinhldwQ9A0pqMbxfDSj9M3kTOmmyZW5tmLsYxCGx08YyUqiFskJCpkH7yom\n9vhr+rTpRiOeTUHmOUEwOWU=",
    client_email: "telkom-interview@interviewtelkom.iam.gserviceaccount.com",
    client_id: "107900815478722730809",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/telkom-interview%40interviewtelkom.iam.gserviceaccount.com"
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
