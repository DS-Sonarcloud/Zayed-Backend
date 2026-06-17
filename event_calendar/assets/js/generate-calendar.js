(function (Drupal, once) {
  Drupal.behaviors.reactLikeCalendar = {
    attach(context) {
      once('reactLikeCalendar', '#calendar-container', context).forEach(container => {
        const calendar = new Calendar(container);
        calendar.render();
      });
    }
  };

  class Calendar {
    constructor(container) {
      this.container = container;
      const today = new Date();
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth();
      this.selectedDate = null; // No date selected initially
      this.today = today;
    }

    render() {
      this.container.innerHTML = '';
      this.container.appendChild(this.createHeader());
      this.container.appendChild(this.createCalendarTable());
    }

    createHeader() {
      const header = document.createElement('div');
      header.className = 'calendar-header';

      // Prev Year
      const prevYearBtn = this.createButton('<< Year', () => {
        this.currentYear--;
        this.render();
      });
      // Prev Month
      const prevMonthBtn = this.createButton('< Month', () => {
        this.currentMonth--;
        if (this.currentMonth < 0) {
          this.currentMonth = 11;
          this.currentYear--;
        }
        this.render();
      });
      // Next Month
      const nextMonthBtn = this.createButton('Month >', () => {
        this.currentMonth++;
        if (this.currentMonth > 11) {
          this.currentMonth = 0;
          this.currentYear++;
        }
        this.render();
      });
      // Next Year
      const nextYearBtn = this.createButton('Year >>', () => {
        this.currentYear++;
        this.render();
      });

      // Display current month/year
      const title = document.createElement('span');
      title.className = 'calendar-title';
      title.textContent = new Date(this.currentYear, this.currentMonth).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      header.append(prevYearBtn, prevMonthBtn, title, nextMonthBtn, nextYearBtn);
      return header;
    }

    createButton(label, onClick) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = 'calendar-nav-btn';
      btn.addEventListener('click', onClick);
      return btn;
    }

    createCalendarTable() {
      const table = document.createElement('table');
      table.className = 'calendar-table';

      // Table head (days)
      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      // Table body (dates)
      const tbody = document.createElement('tbody');

      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

      let row = document.createElement('tr');

      // Blank cells before first day
      for (let i = 0; i < firstDay.getDay(); i++) {
        row.appendChild(document.createElement('td'));
      }

      for (let day = 1; day <= lastDay.getDate(); day++) {
        if (row.children.length === 7) {
          tbody.appendChild(row);
          row = document.createElement('tr');
        }

        const cell = document.createElement('td');
        cell.textContent = day;

        // Highlight today
        if (
          day === this.today.getDate() &&
          this.currentMonth === this.today.getMonth() &&
          this.currentYear === this.today.getFullYear()
        ) {
          cell.classList.add('today');
        }

        // Highlight selected
        if (this.selectedDate === day) {
          cell.classList.add('selected');
        }

        // Click to select date
        cell.addEventListener('click', () => {
          this.selectedDate = day;
          this.render(); // Re-render to update highlight
          // Optionally, do more here: e.g. callback or Drupal.ajax call
        });

        row.appendChild(cell);
      }

      // Fill trailing empty cells to complete week
      while (row.children.length < 7) {
        row.appendChild(document.createElement('td'));
      }
      tbody.appendChild(row);

      table.appendChild(tbody);
      return table;
    }
  }
})(Drupal, once);