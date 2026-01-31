// Configuration
const CSV_FILENAME = 'isl_wise_train_detail_03082015_v1.csv';
const ROWS_PER_PAGE = 50;

let allData = [];
let filteredData = [];
let currentPage = 1;

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    
    // Search listener
    document.getElementById('searchInput').addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // Pagination listeners
    document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changePage(1));
});

// 1. Fetch the CSV Data
async function fetchData() {
    try {
        const response = await fetch(CSV_FILENAME);
        if (!response.ok) throw new Error("Failed to load file. Ensure you are running on a local server.");
        
        const text = await response.text();
        parseCSV(text);
    } catch (error) {
        document.getElementById('loading').textContent = `Error: ${error.message}`;
        console.error(error);
    }
}

// 2. Parse CSV Content
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(','); // Assuming first row is header

    // Start from index 1 to skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma, then clean quotes ('00851' -> 00851)
        const columns = line.split(',').map(col => {
            return col.trim().replace(/^'|'$/g, ""); // Remove surrounding single quotes
        });

        // Mapping columns based on your specific file structure
        // Index: 0:TrainNo, 1:TrainName, 3:StationCode, 4:StationName, 5:Arrival, 6:Departure, 7:Distance, 9:Source, 11:Dest
        if (columns.length > 5) {
            allData.push({
                trainNo: columns[0],
                trainName: columns[1],
                stationCode: columns[3],
                stationName: columns[4],
                arrival: columns[5],
                departure: columns[6],
                distance: columns[7],
                source: columns[9],
                dest: columns[11]
            });
        }
    }

    filteredData = allData; // Initially show all data
    document.getElementById('loading').style.display = 'none';
    renderTable();
}

// 3. Render Table Data
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No trains found</td></tr>';
        return;
    }

    pageData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.trainNo}</td>
            <td>${row.trainName}</td>
            <td>${row.stationCode}</td>
            <td>${row.stationName}</td>
            <td>${row.arrival}</td>
            <td>${row.departure}</td>
            <td>${row.distance} km</td>
            <td>${row.source}</td>
            <td>${row.dest}</td>
        `;
        tbody.appendChild(tr);
    });

    updatePaginationButtons();
}

// 4. Handle Search
function handleSearch(query) {
    const lowerQuery = query.toLowerCase();
    
    filteredData = allData.filter(row => 
        row.trainName.toLowerCase().includes(lowerQuery) ||
        row.trainNo.includes(lowerQuery) ||
        row.stationName.toLowerCase().includes(lowerQuery)
    );

    currentPage = 1; // Reset to first page on search
    renderTable();
}

// 5. Handle Pagination
function changePage(direction) {
    currentPage += direction;
    renderTable();
}

function updatePaginationButtons() {
    const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    
    document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}