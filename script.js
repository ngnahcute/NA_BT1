"use strict";

// Dữ liệu khởi tạo mẫu
let items = [
  {
    "id": 1,
    "title": "Viết báo cáo HTML",
    "dueDate": "2026-10-20",
    "priority": "Cao",
    "status": "pending"
  },
  {
    "id": 2,
    "title": "Ôn Flexbox",
    "dueDate": "2026-10-23",
    "priority": "Trung bình",
    "status": "pending"
  },
  {
    "id": 3,
    "title": "Làm bài DOM",
    "dueDate": "2026-10-19",
    "priority": "Cao",
    "status": "done"
  },
  {
    "id": 4,
    "title": "Đọc tài liệu CSS",
    "dueDate": "2026-10-25",
    "priority": "Thấp",
    "status": "pending"
  },
  {
    "id": 5,
    "title": "Thiết kế trang cá nhân",
    "dueDate": "2026-10-21",
    "priority": "Trung bình",
    "status": "done"
  }
];

// Lấy các phần tử DOM
const taskListEl = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDateInput = document.getElementById("task-date");
const taskPriorityInput = document.getElementById("task-priority");
const errorTitleEl = document.getElementById("error-title");
const errorDateEl = document.getElementById("error-date");
const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");
const taskCountEl = document.getElementById("task-count");
const emptyStateEl = document.getElementById("empty-state");

// Tự động gán thuộc tính min cho input date là ngày hôm nay để chặn chọn ngày quá khứ trên giao diện
const todayStr = new Date().toISOString().split("T")[0];
taskDateInput.min = todayStr;

// C1: Hàm hiển thị dữ liệu từ mảng lên DOM
function renderTasks(tasksToRender) {
  taskListEl.innerHTML = "";
  
  if (tasksToRender.length === 0) {
    emptyStateEl.classList.remove("hidden");
  } else {
    emptyStateEl.classList.add("hidden");
  }

  tasksToRender.forEach((task, index) => {
    const tr = document.createElement("tr");

    let priorityClass = "badge-trung-binh";
    if (task.priority === "Cao") priorityClass = "badge-cao";
    if (task.priority === "Thấp") priorityClass = "badge-thap";

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="${task.status === 'done' ? 'status-done' : ''}">${escapeHtml(task.title)}</td>
      <td>${task.dueDate || 'Không có'}</td>
      <td><span class="badge ${priorityClass}">${task.priority}</span></td>
      <td>
        <span class="badge ${task.status === 'done' ? 'badge-thap' : 'badge-trung-binh'}">
          ${task.status === 'done' ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
        </span>
      </td>
      <td>
        <button class="btn-action btn-toggle" onclick="toggleTaskStatus(${task.id})">
          ${task.status === 'done' ? 'Hoàn tác' : 'Hoàn thành'}
        </button>
        <button class="btn-action btn-delete" onclick="deleteTask(${task.id})">Xóa</button>
      </td>
    `;
    taskListEl.appendChild(tr);
  });

  taskCountEl.textContent = `Hiển thị ${tasksToRender.length} công việc`;
}

// C2: Hàm đọc form, kiểm tra dữ liệu và thêm bản ghi
taskForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const dueDate = taskDateInput.value;
  const priority = taskPriorityInput.value;

  let isValid = true;

  // Kiểm tra tên công việc không được rỗng
  if (!title) {
    errorTitleEl.textContent = "Tên công việc không được để trống!";
    taskTitleInput.focus();
    isValid = false;
  } else {
    errorTitleEl.textContent = "";
  }

  // Kiểm tra nếu có nhập ngày thì không được là ngày trong quá khứ
  if (dueDate) {
    if (dueDate < todayStr) {
      errorDateEl.textContent = "Hạn hoàn thành không được là ngày trong quá khứ!";
      taskDateInput.focus();
      isValid = false;
    } else {
      errorDateEl.textContent = "";
    }
  } else {
    errorDateEl.textContent = "";
  }

  if (!isValid) return;

  // Thêm công việc mới vào mảng
  const newTask = {
    id: Date.now(),
    title: title,
    dueDate: dueDate,
    priority: priority,
    status: "pending"
  };

  items.unshift(newTask);

  // Cập nhật lại giao diện và reset form
  filterAndRender();
  taskForm.reset();
  taskPriorityInput.value = "Trung bình";
  errorTitleEl.textContent = "";
  errorDateEl.textContent = "";
});

// C3: Chức năng tìm kiếm và lọc trạng thái
function filterAndRender() {
  const keyword = searchInput.value.toLowerCase().trim();
  const statusFilter = filterStatus.value;

  const filtered = items.filter(task => {
    const matchTitle = task.title.toLowerCase().includes(keyword);
    const matchStatus = statusFilter === "all" || task.status === statusFilter;
    return matchTitle && matchStatus;
  });

  renderTasks(filtered);
}

searchInput.addEventListener("input", filterAndRender);
filterStatus.addEventListener("change", filterAndRender);

// C4: Chức năng cập nhật trạng thái và xóa theo ID
window.toggleTaskStatus = function(id) {
  const task = items.find(t => t.id === id);
  if (task) {
    task.status = task.status === "done" ? "pending" : "done";
    filterAndRender();
  }
};

window.deleteTask = function(id) {
  if (confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
    items = items.filter(t => t.id !== id);
    filterAndRender();
  }
};

// Hàm phụ trợ chống XSS cơ bản
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Khởi chạy hiển thị lần đầu khi tải trang
filterAndRender();