class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.currentFilter = 'all';
    this.searchQuery = '';

    // Initialize without animations first
    this.updateStats();
    this.renderTasks();
    this.initializeEventListeners();

    // Add animations after a short delay
    setTimeout(() => {
      this.addWelcomeAnimation();
    }, 100);
  }

  addWelcomeAnimation() {
    // Add staggered animation to elements
    const elements = document.querySelectorAll('.animate-fade-in, .animate-slide-up, .animate-slide-down');
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`;
    });
  }

  initializeEventListeners() {
    // Form submission
    document.getElementById('taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderTasks();
    });

    // Clear completed tasks
    document.getElementById('clearCompleted').addEventListener('click', () => {
      this.clearCompletedTasks();
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('taskForm').dispatchEvent(new Event('submit'));
      }
    });
  }

  addTask() {
    const form = document.getElementById('taskForm');
    const formData = new FormData(form);

    const task = {
      id: Date.now().toString(),
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      category: formData.get('category'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate'),
      completed: false,
      createdAt: new Date().toISOString()
    };

    if (!task.title) {
      this.showToast('Oops!', 'Please enter a task title', 'error');
      return;
    }

    this.tasks.unshift(task);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    form.reset();

    this.showToast('Awesome!', 'Task added successfully!', 'success');
    this.addConfetti();
  }

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
      this.updateStats();

      if (task.completed) {
        this.showToast('Great job!', 'Task completed!', 'success');
        this.addConfetti();
      } else {
        this.showToast('Task updated', 'Marked as pending', 'info');
      }
    }
  }

  deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
      this.showToast('Deleted', 'Task removed successfully!', 'success');
    }
  }

  editTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle && newTitle.trim()) {
      task.title = newTitle.trim();
      this.saveTasks();
      this.renderTasks();
      this.showToast('Updated!', 'Task updated successfully!', 'success');
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;

    // Update active filter button with animation
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.transform = 'scale(1)';
    });

    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    activeBtn.classList.add('active');
    activeBtn.style.transform = 'scale(1.05)';

    this.renderTasks();
  }

  clearCompletedTasks() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      this.showToast('Nothing to clear', 'No completed tasks found', 'info');
      return;
    }

    if (confirm(`Delete ${completedCount} completed task(s)?`)) {
      this.tasks = this.tasks.filter(t => !t.completed);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
      this.showToast('Cleaned up!', `${completedCount} completed task(s) deleted!`, 'success');
    }
  }

  getFilteredTasks() {
    let filteredTasks = this.tasks;

    // Apply filter
    switch (this.currentFilter) {
      case 'pending':
        filteredTasks = filteredTasks.filter(t => !t.completed);
        break;
      case 'completed':
        filteredTasks = filteredTasks.filter(t => t.completed);
        break;
      case 'high':
        filteredTasks = filteredTasks.filter(t => t.priority === 'high');
        break;
    }

    // Apply search
    if (this.searchQuery) {
      filteredTasks = filteredTasks.filter(t =>
        t.title.toLowerCase().includes(this.searchQuery) ||
        t.description.toLowerCase().includes(this.searchQuery) ||
        t.category.toLowerCase().includes(this.searchQuery)
      );
    }

    return filteredTasks;
  }

  renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0 && this.tasks.length === 0) {
      // Show sample task when no real tasks exist
      tasksList.innerHTML = `
            <div class="task-card glass-effect rounded-3xl shadow-xl border border-white/20 p-8 animate-slide-up">
                <div class="flex items-start space-x-6">
                    <div class="flex-shrink-0 mt-2">
                        <input type="checkbox" class="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all duration-200" disabled>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="text-xl font-bold text-gray-900 mb-2">Welcome to TaskMaster Pro!</h3>
                                <p class="text-gray-600 mb-4 leading-relaxed">This is a sample task to show you how awesome your tasks will look. Create your first real task above!</p>
                            
                            <div class="flex flex-wrap items-center gap-3 mb-4">
                                <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border bg-blue-100 text-blue-800 border-blue-200">
                                    🟡 Medium Priority
                                </span>
                                <span class="inline-flex items-center text-sm font-semibold text-purple-600">
                                    <span class="text-lg mr-2">🏠</span>
                                    Personal
                                </span>
                            </div>
                            
                            <div class="text-xs text-gray-400 font-medium">
                                Sample task by Arabawy
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3 ml-6 opacity-50">
                            <button class="p-3 text-gray-400 rounded-2xl cursor-not-allowed" disabled>
                                <i class="fas fa-edit text-lg"></i>
                            </button>
                            <button class="p-3 text-gray-400 rounded-2xl cursor-not-allowed" disabled>
                                <i class="fas fa-trash text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
      emptyState.classList.add('hidden');
      return;
    }

    if (filteredTasks.length === 0) {
      tasksList.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    tasksList.innerHTML = filteredTasks.map((task, index) => this.createTaskHTML(task, index)).join('');

    // Add event listeners to task elements
    filteredTasks.forEach(task => {
      const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
      if (!taskElement) return;

      // Toggle completion
      const checkbox = taskElement.querySelector('.task-checkbox');
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          this.toggleTask(task.id);
        });
      }

      // Delete task
      const deleteBtn = taskElement.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.deleteTask(task.id);
        });
      }

      // Edit task
      const editBtn = taskElement.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          this.editTask(task.id);
        });
      }
    });
  }

  createTaskHTML(task, index) {
    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡' },
      high: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴' }
    };

    const categoryConfig = {
      personal: { icon: '🏠', color: 'text-blue-600' },
      work: { icon: '💼', color: 'text-purple-600' },
      shopping: { icon: '🛒', color: 'text-green-600' },
      health: { icon: '❤️', color: 'text-red-600' },
      study: { icon: '📚', color: 'text-indigo-600' },
      other: { icon: '📝', color: 'text-gray-600' }
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;
    const priority = priorityConfig[task.priority];
    const category = categoryConfig[task.category];

    return `
            <div class="task-card glass-effect rounded-3xl shadow-xl border border-white/20 p-8 ${task.completed ? 'opacity-60' : ''} animate-slide-up" 
                 data-task-id="${task.id}" style="animation-delay: ${index * 0.1}s">
                <div class="flex items-start space-x-6">
                    <div class="flex-shrink-0 mt-2">
                        <input type="checkbox" class="task-checkbox w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all duration-200" ${task.completed ? 'checked' : ''}>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="text-xl font-bold text-gray-900 mb-2 ${task.completed ? 'line-through text-gray-500' : ''}">${task.title}</h3>
                                ${task.description ? `<p class="text-gray-600 mb-4 leading-relaxed ${task.completed ? 'line-through' : ''}">${task.description}</p>` : ''}
                                
                                <div class="flex flex-wrap items-center gap-3 mb-4">
                                    <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${priority.color}">
                                        ${priority.icon} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                    </span>
                                    
                                    <span class="inline-flex items-center text-sm font-semibold ${category.color}">
                                        <span class="text-lg mr-2">${category.icon}</span>
                                        ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                                    </span>
                                    
                                    ${dueDate ? `
                                        <span class="inline-flex items-center text-sm font-semibold ${isOverdue ? 'text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200' : 'text-gray-600'}">
                                            <i class="fas fa-calendar mr-2"></i>
                                            ${dueDate} ${isOverdue ? '(Overdue!)' : ''}
                                        </span>
                                    ` : ''}
                                </div>
                                
                                <div class="text-xs text-gray-400 font-medium">
                                    Created ${new Date(task.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-3 ml-6">
                                <button class="edit-btn p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200 transform hover:scale-110" title="Edit task">
                                    <i class="fas fa-edit text-lg"></i>
                                </button>
                                <button class="delete-btn p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 transform hover:scale-110" title="Delete task">
                                    <i class="fas fa-trash text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  updateStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.completed).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Animate numbers
    this.animateNumber('totalTasks', totalTasks);
    this.animateNumber('completedTasks', completedTasks);
    this.animateNumber('progressPercentage', progressPercentage, '%');
  }

  animateNumber(elementId, targetValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const currentValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;

    // Prevent infinite loop - just set the value directly
    element.textContent = targetValue + suffix;
  }

  showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Set icon and colors based on type
    const config = {
      success: { icon: 'fas fa-check-circle text-green-500', bg: 'bg-green-50 border-green-200' },
      error: { icon: 'fas fa-exclamation-circle text-red-500', bg: 'bg-red-50 border-red-200' },
      info: { icon: 'fas fa-info-circle text-blue-500', bg: 'bg-blue-50 border-blue-200' }
    };

    toastIcon.innerHTML = `<i class="${config[type].icon}"></i>`;
    toast.className = `fixed top-8 right-8 text-gray-800 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-500 z-50 min-w-80 ${config[type].bg}`;

    // Show toast
    toast.classList.remove('translate-x-full');

    // Hide after 4 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
    }, 4000);
  }

  addConfetti() {
    // Simple confetti effect
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1000;
                    animation: confetti-fall 3s linear forwards;
                `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }, i * 50);
    }
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
