// 任务数据模型
let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];

// DOM元素
const taskInput = document.getElementById('taskInput');
const taskTag = document.getElementById('taskTag');
const dueDate = document.getElementById('dueDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearAllBtn = document.getElementById('clearAllBtn');
const taskList = document.getElementById('taskList');

// 设置默认日期为明天
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dueDate.valueAsDate = tomorrow;

// 初始化应用
function initApp() {
    renderTasks();
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 添加任务
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // 搜索任务
    searchInput.addEventListener('input', renderTasks);
    
    // 过滤任务
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks();
        });
    });
    
    // 清空全部任务
    clearAllBtn.addEventListener('click', clearAllTasks);
}

// 添加新任务
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        tag: taskTag.value,
        dueDate: dueDate.value,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    
    // 重置输入
    taskInput.value = '';
    taskInput.focus();
}

// 切换任务完成状态
function toggleTask(id) {
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

// 编辑任务
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newText = prompt('编辑任务:', task.text);
    
    if (newText !== null && newText.trim() !== '') {
        tasks = tasks.map(t => 
            t.id === id ? { ...t, text: newText.trim() } : t
        );
        saveTasks();
        renderTasks();
    }
}

// 删除任务
function deleteTask(id) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// 清空所有任务
function clearAllTasks() {
    if (tasks.length === 0) return;
    
    if (confirm('确定要清空所有任务吗？此操作不可撤销。')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

// 保存任务到localStorage
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// 渲染任务列表
function renderTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    
    // 过滤任务
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);
        let matchesFilter = true;
        
        if (activeFilter === 'active') matchesFilter = !task.completed;
        if (activeFilter === 'completed') matchesFilter = task.completed;
        
        return matchesSearch && matchesFilter;
    });
    
    // 清空任务列表
    taskList.innerHTML = '';
    
    // 如果没有任务，显示空状态
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">📝</div>
            <h3>暂无任务</h3>
            <p>${searchTerm ? '没有找到匹配的任务' : '添加一些任务来开始管理您的待办事项'}</p>
        `;
        taskList.appendChild(emptyState);
        return;
    }
    
    // 渲染任务
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // 格式化日期
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN') : '';
        
        // 检查是否过期
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span class="task-tag">${getTagText(task.tag)}</span>
                    ${dueDate ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">${isOverdue ? '已过期 ' : ''}${dueDate}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" title="编辑任务">✏️</button>
                <button class="delete-btn" title="删除任务">🗑️</button>
            </div>
        `;
        
        // 添加事件监听器
        const checkbox = taskItem.querySelector('.task-checkbox');
        const editBtn = taskItem.querySelector('.edit-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => toggleTask(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(taskItem);
    });
    
    // 检查并删除过期任务
    checkAndRemoveOverdueTasks();
}

// 获取标签文本
function getTagText(tag) {
    const tagMap = {
        'default': '默认',
        'work': '工作',
        'study': '学习',
        'life': '生活'
    };
    return tagMap[tag] || tag;
}

// 检查并删除过期任务（扩展功能）
function checkAndRemoveOverdueTasks() {
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < now
    );
    
    if (overdueTasks.length > 0) {
        // 在实际应用中，可以添加自动删除逻辑
        // 这里只是演示，不实际自动删除
        console.log('有过期任务:', overdueTasks);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);
