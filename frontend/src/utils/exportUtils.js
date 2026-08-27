import axios from 'axios';

export const downloadCSV = async (url, filename, setExporting, setMessage) => {
  if (setExporting) setExporting(true);
  try {
    const response = await axios.get(url, { responseType: 'blob' });
    
    // Create blob link to download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    
    // Append to html link element page
    document.body.appendChild(link);
    
    // Start download
    link.click();
    
    // Clean up and remove the link
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    if (setMessage) setMessage({ type: 'success', text: `Export successful: ${filename}` });
  } catch (error) {
    console.error('Export failed:', error);
    let errorMsg = 'Failed to export data.';
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMsg = 'Unauthorized to export data.';
    } else if (error.response?.status === 500) {
      errorMsg = 'Server error during export.';
    }
    
    // If response type was blob, we need to parse the error message if it's JSON
    if (error.response && error.response.data instanceof Blob) {
       try {
         const text = await error.response.data.text();
         const json = JSON.parse(text);
         if (json.message) errorMsg = json.message;
       } catch (e) {
         // Ignore if not parseable
       }
    }
    
    if (setMessage) setMessage({ type: 'error', text: errorMsg });
  } finally {
    if (setExporting) setExporting(false);
  }
};
