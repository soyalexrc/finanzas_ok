import XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export async function exportXSLX(transactions: any[], settings: any[], categories: any[], accounts: any[], fileName: string) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to sheets and append them to the workbook
    const dataSheet = XLSX.utils.json_to_sheet(transactions);
    XLSX.utils.book_append_sheet(wb, dataSheet, "Transactions");

    const settingsSheet = XLSX.utils.json_to_sheet(settings);
    XLSX.utils.book_append_sheet(wb, settingsSheet, "Settings");

    const categoriesSheet = XLSX.utils.json_to_sheet(categories);
    XLSX.utils.book_append_sheet(wb, categoriesSheet, "Categories");

    const accountsSheet = XLSX.utils.json_to_sheet(accounts);
    XLSX.utils.book_append_sheet(wb, accountsSheet, "Accounts");

    const wbout = XLSX.write(wb, {
        type: 'base64',
        bookType: "xlsx"
    });

    const uri = FileSystem.cacheDirectory + fileName + '.xlsx';
    // console.log(`Writing to ${JSON.stringify(uri)} with text: ${wbout}`);
    await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64
    });

    await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'MyWater data',
        UTI: 'com.microsoft.excel.xlsx'
    });
}

export async function readXlsxFile(): Promise<any> {
    try {

        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        if (result.assets && result.assets.length > 0) {
            const fileUri = result.assets[0].uri;

            // Read the file from the given URI
            const fileData = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert the base64 string to a binary string
            const binaryString = atob(fileData);

            // Create a new workbook from the binary string
            const workbook = XLSX.read(binaryString, { type: 'binary' });

            // Initialize an object to hold the data from each sheet
            const sheetsData: { [key: string]: any[] } = {};

            // Iterate over each sheet and convert it to JSON
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
            });

            return {
                settings: sheetsData['Settings'],
                transactions: sheetsData['Transactions'],
                categories: sheetsData['Categories'],
                accounts: sheetsData['Accounts'],
            }

            // // Get the first sheet name
            // const sheetName = workbook.SheetNames[0];
            //
            // // Get the worksheet
            // const worksheet = workbook.Sheets[sheetName];
            //
            // // Convert the worksheet to JSON
            // const jsonData = XLSX.utils.sheet_to_json(worksheet);
            //
            // return jsonData;
        } else {
            return null;
        }


    } catch (error) {
        console.error('Error reading XLSX file:', error);
        return [];
    }
}
