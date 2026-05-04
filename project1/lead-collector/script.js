document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('lead-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const successMessage = document.getElementById('success-message');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!email) return;

        // Visual feedback
        submitBtn.textContent = '處理中...';
        submitBtn.disabled = true;

        // Simulating a network request to an Agent backend
        setTimeout(() => {
            // Save lead to local browser storage for admin to view/download
            const newLead = {
                id: Date.now(),
                name: name || '未提供稱呼',
                email: email,
                date: new Date().toLocaleString('zh-TW')
            };

            const existingLeads = JSON.parse(localStorage.getItem('agent_leads') || '[]');
            existingLeads.push(newLead);
            localStorage.setItem('agent_leads', JSON.stringify(existingLeads));

            // Show success message and hide form
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');

            // Optionally, reset form (though hidden now)
            form.reset();
        }, 800);
    });
});
