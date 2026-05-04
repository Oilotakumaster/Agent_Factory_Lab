document.addEventListener('DOMContentLoaded', () => {
    const leadsBody = document.getElementById('leads-body');
    const totalLeadsEl = document.getElementById('total-leads');
    const noDataEl = document.getElementById('no-data');
    const tableEl = document.getElementById('leads-table');
    const exportBtn = document.getElementById('export-csv-btn');
    const clearBtn = document.getElementById('clear-data-btn');

    function loadLeads() {
        const leads = JSON.parse(localStorage.getItem('agent_leads') || '[]');
        
        totalLeadsEl.textContent = leads.length;

        if (leads.length === 0) {
            tableEl.classList.add('hidden');
            noDataEl.classList.remove('hidden');
            exportBtn.disabled = true;
            exportBtn.style.opacity = '0.5';
            return;
        }

        tableEl.classList.remove('hidden');
        noDataEl.classList.add('hidden');
        exportBtn.disabled = false;
        exportBtn.style.opacity = '1';

        leadsBody.innerHTML = '';
        // Reverse array so newest submissions show at the top
        leads.slice().reverse().forEach(lead => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${lead.date}</td>
                <td>${lead.name}</td>
                <td>${lead.email}</td>
            `;
            leadsBody.appendChild(tr);
        });
    }

    function exportToCSV() {
        const leads = JSON.parse(localStorage.getItem('agent_leads') || '[]');
        if (leads.length === 0) return;

        // Create CSV Header and content
        const headers = ['時間 (Date)', '稱呼 (Name)', '聯絡信箱 (Email)'];
        const csvRows = [headers.join(',')];

        leads.forEach(lead => {
            // Escape quotes in case users input commas or quotes
            const safeDate = `"${lead.date.replace(/"/g, '""')}"`;
            const safeName = `"${lead.name.replace(/"/g, '""')}"`;
            const safeEmail = `"${lead.email.replace(/"/g, '""')}"`;
            csvRows.push([safeDate, safeName, safeEmail].join(','));
        });

        // Use UTF-8 with BOM to ensure Excel opens it correctly with Chinese
        const csvString = '\uFEFF' + csvRows.join('\n'); 
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent_leads_${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function clearData() {
        if (confirm('⚠️ 警告：確定要清空所有名單嗎？這個動作無法復原！')) {
            localStorage.removeItem('agent_leads');
            loadLeads();
        }
    }

    // Event Listeners
    exportBtn.addEventListener('click', exportToCSV);
    clearBtn.addEventListener('click', clearData);

    // Initial Load
    loadLeads();
});
