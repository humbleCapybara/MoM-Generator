document.addEventListener('DOMContentLoaded', () => {
            // Set default date and time
            const today = new Date();
            const yyyy = String(today.getFullYear());
            const mm = String(today.getMonth() + 1).padStart(2,'0');
            const dd = String(today.getDay() + 1).padStart(2,'0');
            document.getElementById('meeting-date').value = `${yyyy}-${mm}-${dd}`;

            const hh = String(today.getHours()).padStart(2,'0');
            const min = String(today.getMinutes()).padStart(2,'0');
            document.getElementById('meeting-time').value = `${hh}:${min}`;

            // DOM Element References
            const addAgendaBtn = document.getElementById('add-agenda-item');
            const agendaList = document.getElementById('agenda-list');
            const addActionBtn = document.getElementById('add-action-item');
            const actionList = document.getElementById('action-items-list');
            const generateBtn = document.getElementById('generate-btn');
            const minutesContainer = document.getElementById('generated-minutes-container');
            const minutesOutput = document.getElementById('generated-minutes');
            const copyBtn = document.getElementById('copy-btn');
            const downloadPdfBtn = document.getElementById('download-pdf-btn');
            const copySuccessMsg = document.getElementById('copy-success-msg');

            // --- Event Listener for Adding Agenda Items ---
            addAgendaBtn.addEventListener('click', () => {
                const newItem = document.createElement('div');
                newItem.className = 'flex items-center gap-2';
                newItem.innerHTML = `
                    <input type="text" class="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Another agenda item">
                    <button class="remove-item-btn bg-red-500 hover:bg-red-600 text-white p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>
                    </button>
                `;
                agendaList.appendChild(newItem);
            });

            // Event Listener for Adding Action Items
            addActionBtn.addEventListener('click', () => {
                const newItem = document.createElement('div');
                newItem.className = 'p-4 border border-gray-300 rounded-lg bg-gray-50/50';
                newItem.innerHTML = `
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <input type="text" class="action-task w-full p-2 border border-gray-300 rounded-md" placeholder="Task description">
                        <input type="text" class="action-owner w-full p-2 border border-gray-300 rounded-md" placeholder="Assigned to">
                        <input type="date" class="action-deadline w-full p-2 border border-gray-300 rounded-md">
                    </div>
                    <button class="remove-item-btn mt-2 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded-md">Remove</button>
                `;
                actionList.appendChild(newItem);
            });

            // --- Event Delegation for Removing Items ---
            document.body.addEventListener('click', (e) => {
                if (e.target.closest('.remove-item-btn')) {
                    e.target.closest('.remove-item-btn').parentElement.remove();
                }
            });

            generateBtn.addEventListener('click', () => {
                // Helper function to format date
                const formatDate = (dateStr) => {
                    if (!dateStr) return 'N/A';
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
                };

                // Helper function to format time
                const formatTime = (timeStr) => {
                    if (!timeStr) return '';
                    let [hours, minutes] = timeStr.split(':');
                    let ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    return `${hours}:${minutes} ${ampm}`;
                };

                // 1. Get all values from the form
                const title = document.getElementById('meeting-title').value || 'Meeting Minutes';
                const date = formatDate(document.getElementById('meeting-date').value);
                const time = formatTime(document.getElementById('meeting-time').value);
                const location = document.getElementById('meeting-location').value || 'Not specified';
                const attendees = document.getElementById('attendees').value.split('\n').filter(line => line.trim() !== '');
                const discussion = document.getElementById('discussion').value.split('\n').filter(line => line.trim() !== '');

                const agendaItems = Array.from(agendaList.querySelectorAll('input[type="text"]')).map(input => input.value).filter(val => val.trim() !== '');
                
                const actionItems = Array.from(actionList.children).map(item => {
                    const task = item.querySelector('.action-task').value;
                    const owner = item.querySelector('.action-owner').value;
                    const deadline = item.querySelector('.action-deadline').value;
                    return { task, owner, deadline: deadline ? formatDate(deadline) : 'N/A' };
                }).filter(item => item.task.trim() !== '');

                const nextMeetingDate = formatDate(document.getElementById('next-meeting-date').value);
                const nextMeetingTime = formatTime(document.getElementById('next-meeting-time').value);
                const nextMeetingLocation = document.getElementById('next-meeting-location').value || 'TBD';

                // Get page variables
                const doc = new jspdf.jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const my = 5;
                const mx = 10;
                let posY = my;
                
                // Place image at the center
                const imageWidth = 20;
                const imageHeight = 20;
                const imageX = (pageWidth - imageWidth) / 2;
                posY = posY + 10;
                const imageData = data.logo;
                doc.addImage(imageData, 'PNG', imageX, posY, imageWidth, imageHeight);

                // Place title at the center
                doc.setFontSize(20); // Set a normal font size
                doc.setTextColor(0, 0, 0); // Set color back to black
                doc.setFont("helvetica", "bold"); // Set font style to bold
                posY = posY + imageWidth + my;
                doc.text(title, pageWidth / 2, posY, { align: 'center' });

                // Meeting Details
                const meetingDetails = `Date: ${date} | Time: ${time} | Location: ${location}`;
                doc.setFontSize(12); // Set a normal font size
                doc.setTextColor(0, 0, 0); // Set color back to black
                doc.setFont("helvetica", "normal"); // Set font style to bold
                posY = posY + my + 5;
                doc.text(meetingDetails, pageWidth / 2, posY, { align: 'center' });

                // Horizontal Line
                const lineX = 10;
                posY = posY + my;
                doc.line(lineX, posY, pageWidth - 10, posY);
                posY = posY + my + 5;

                // Agenda
                if (agendaItems.length !== 0){
                    const AgendaTitle = 'Agenda';
                    doc.setFontSize(16); // Set a normal font size
                    doc.setTextColor(0, 0, 0); // Set color back to black
                    doc.setFont("helvetica", "bold"); // Set font style to bold
                    let counter = 1;
                    doc.text(AgendaTitle, mx, posY);
                    posY = posY + my+3;
                    doc.setFontSize(12); // Set a normal font size
                    doc.setFont("helvetica", "normal"); // Set font style to bold
                    for (agenda of agendaItems) {
                        if(posY > pageHeight - 20){
                            doc.addPage();
                            posY = 20;
                        }
                        doc.text(`${counter}. ${agenda}`, mx, posY);
                        posY = posY + my;
                        counter++;
                    }
                }
                
                // Discussion


                
                // Save file
                doc.save('mom.pdf');
            });
        });