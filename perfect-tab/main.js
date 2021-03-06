chrome.contextMenus.removeAll()
// Frequent Sites logic
var f_sites = new Vue({
    el: '#f_sites',
    data: {
        frequentSitesArray: [],
        numberOfItems: 10
    },
    created: function() {
        this.getFrequentSites();
    },
    watch: {
        numberOfItems: function() {
            this.getFrequentSites();
        }
    },
    methods: {
        getFrequentSites: function() {
            var self = this;
            chrome.topSites.get((callback) => {
                self.frequentSitesArray = []
                for (var i = 0; i < this.numberOfItems; i++) {
                    self.frequentSitesArray.push({
                        'title': callback[i].title,
                        'url': callback[i].url,
                        'faviconUrl': 'chrome://favicon/' + callback[i].url
                    })
                }
            })
        },
        openLink: openLink
    }
})

// Recent Bookmarks logic
var r_bookmarks = new Vue({
    el: '#r_bookmarks',
    data: {
        recentBookmarksArray: [],
        numberOfItems: 10,
        checkedItems: [],
        deleteMode: false
    },
    created: function() {
        this.getRecentBookmarks()
    },
    watch: {
        numberOfItems: function() {
            this.getRecentBookmarks()
        }
    },
    computed: {
      focusDeleteBtn: function(){
        console.log(this.deleteMode);
        return !this.deleteMode
      }
    },
    methods: {
        deleteCheckedBookmarks: function() {
          if(this.deleteMode === false){
            this.deleteMode = true

          } else {
            this.checkedItems.forEach(function(elem){
              chrome.bookmarks.remove(elem)
            })
            this.checkedItems = []
            this.getRecentBookmarks()
            this.deleteMode = false
          }

        },
        getRecentBookmarks: function() {
            const self = this
            self.recentBookmarksArray = []
            chrome.bookmarks.getRecent(self.numberOfItems, (callback) => {
                for (var i = 0; i < self.numberOfItems; i++) {
                    self.recentBookmarksArray.push({
                        'title': callback[i].title,
                        'url': callback[i].url,
                        'faviconUrl': 'chrome://favicon/' + callback[i].url,
                        'id': callback[i].id
                    })
                }
            })
        },
        openLink: openLink
    }
})

// ToDo list logic
var todoStorage = {
    save: function(todos) {
        chrome.storage.sync.set({ 'chromeTodoItems': todos }, function() {
            if (chrome.runtime.lastError) {
                throw ('Runtime lastError while saving data to chrome storage')
            }
        })
    }
}
var todos_app = new Vue({
    el: '#todos_app',
    data: {
        app_name: 'Todos',
        todos: [],
        todoText: '',
        doneItems: []
    },
    watch: {
        todos: {
            deep: true,
            handler: function(todos) {
                todoStorage.save(todos)
            }
        }
    },
    computed: {
        pendingTodos: function() {
            return this.todos.filter(function(el) {
                return el.done !== true;
            })
        }
    },
    created: function() {
        var self = this
        chrome.storage.sync.get('chromeTodoItems', function(items) {
            if (!chrome.runtime.lastError) {
                if (items.chromeTodoItems != null) {
                    self.todos = items.chromeTodoItems
                } else {
                    console.log('No todo items in Chrome Storage')
                }
            } else {
                console.error("Runtime Error while fetching data from Chrome Storage")
            }
        })
    },
    methods: {
        addTodo: function(todoText) {
            var text = this.todoText && this.todoText.trim()
            if (text == '') {
                this.todoText = ''
                return
            }
            var todo = {
                'todoId': todoStorage.uid++,
                'text': text,
                'done': false,
                'timeAdded': Date.now()
            }
            this.todos.push(todo)
            this.todoText = ''
        },
        checkItems: function() {
            document.getElementById('trash').style.visibility = 'visible'
        }
    }
})

// Footer logic
var footer = new Vue({
    el: '#footer',
    methods: {
        openLink: openLink
    }
})

//This method opens all links overridding chrome blockage of file-system urls
function openLink(url) {
    if (url === 'restore session') {
        chrome.sessions.restore();
        return;
    }
    chrome.tabs.update({ 'url': url, 'selected': true })
}
