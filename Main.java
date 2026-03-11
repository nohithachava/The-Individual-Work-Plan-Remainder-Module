import java.util.*;

class Task {
    String id;
    String name;
    String priority;
    String date;
    String time;
    String description;
    String category;
    List<Integer> reminders;
    boolean completed;
    String createdAt;
    String completedAt;

    Task(String id, String name, String priority, String date, String time,
         String description, String category, List<Integer> reminders) {
        this.id = id;
        this.name = name;
        this.priority = priority;
        this.date = date;
        this.time = time;
        this.description = description;
        this.category = category;
        this.reminders = new ArrayList<>(reminders);
        this.completed = false;
        this.createdAt = new Date().toString();
        this.completedAt = "";
    }

    void display() {
        System.out.println("\nTask ID      : " + id);
        System.out.println("Task Name    : " + name);
        System.out.println("Priority     : " + priority);
        System.out.println("Date         : " + date);
        System.out.println("Time         : " + time);
        System.out.println("Category     : " + category);
        System.out.println("Description  : " + description);
        System.out.println("Reminders    : " + reminders + " min before");
        System.out.println("Completed    : " + completed);
    }
}

class TaskNode {
    Task task;
    TaskNode next;

    TaskNode(Task task) {
        this.task = task;
        this.next = null;
    }
}

class TaskLinkedList {
    TaskNode head;
    int size;

    TaskLinkedList() {
        head = null;
        size = 0;
    }

    void append(Task task) {
        TaskNode newNode = new TaskNode(task);
        if (head == null) {
            head = newNode;
        } else {
            TaskNode cur = head;
            while (cur.next != null) {
                cur = cur.next;
            }
            cur.next = newNode;
        }
        size++;
    }

    Task searchById(String id) {
        TaskNode cur = head;
        while (cur != null) {
            if (cur.task.id.equals(id)) {
                return cur.task;
            }
            cur = cur.next;
        }
        return null;
    }

    boolean remove(String id) {
        if (head == null) return false;

        if (head.task.id.equals(id)) {
            head = head.next;
            size--;
            return true;
        }

        TaskNode cur = head;
        while (cur.next != null) {
            if (cur.next.task.id.equals(id)) {
                cur.next = cur.next.next;
                size--;
                return true;
            }
            cur = cur.next;
        }
        return false;
    }

    List<Task> toArray() {
        List<Task> list = new ArrayList<>();
        TaskNode cur = head;
        while (cur != null) {
            list.add(cur.task);
            cur = cur.next;
        }
        return list;
    }

    void displayAllActive() {
        TaskNode cur = head;
        boolean found = false;
        while (cur != null) {
            if (!cur.task.completed) {
                cur.task.display();
                found = true;
            }
            cur = cur.next;
        }
        if (!found) {
            System.out.println("No active tasks found.");
        }
    }

    void displayCompleted() {
        TaskNode cur = head;
        boolean found = false;
        while (cur != null) {
            if (cur.task.completed) {
                cur.task.display();
                found = true;
            }
            cur = cur.next;
        }
        if (!found) {
            System.out.println("No completed tasks found.");
        }
    }
}

class ActionStack {
    Stack<String> stack = new Stack<>();

    void pushAction(String action) {
        stack.push(action);
    }

    void undoLastAction() {
        if (stack.isEmpty()) {
            System.out.println("No actions to undo.");
        } else {
            System.out.println("Undo action: " + stack.pop());
        }
    }

    void showHistory() {
        if (stack.isEmpty()) {
            System.out.println("No recent actions.");
            return;
        }
        System.out.println("\nRecent Actions:");
        for (int i = stack.size() - 1; i >= 0; i--) {
            System.out.println("- " + stack.get(i));
        }
    }
}

class NotificationQueue {
    Queue<String> queue = new LinkedList<>();

    void addNotification(String message) {
        queue.offer(message);
    }

    void showNotifications() {
        if (queue.isEmpty()) {
            System.out.println("No notifications.");
            return;
        }
        System.out.println("\nNotifications:");
        for (String msg : queue) {
            System.out.println("- " + msg);
        }
    }

    void processNextNotification() {
        String msg = queue.poll();
        if (msg == null) {
            System.out.println("No notifications to process.");
        } else {
            System.out.println("Processed notification: " + msg);
        }
    }
}

class UserAccount {
    String username;
    String password;
    String fullName;

    UserAccount(String username, String password, String fullName) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
    }
}

class MergeSorter {
    static List<Task> mergeSort(List<Task> arr, Comparator<Task> comp) {
        if (arr.size() <= 1) return arr;

        int mid = arr.size() / 2;
        List<Task> left = mergeSort(new ArrayList<>(arr.subList(0, mid)), comp);
        List<Task> right = mergeSort(new ArrayList<>(arr.subList(mid, arr.size())), comp);

        return merge(left, right, comp);
    }

    static List<Task> merge(List<Task> left, List<Task> right, Comparator<Task> comp) {
        List<Task> result = new ArrayList<>();
        int i = 0, j = 0;

        while (i < left.size() && j < right.size()) {
            if (comp.compare(left.get(i), right.get(j)) <= 0) {
                result.add(left.get(i++));
            } else {
                result.add(right.get(j++));
            }
        }

        while (i < left.size()) result.add(left.get(i++));
        while (j < right.size()) result.add(right.get(j++));

        return result;
    }
}

class WorkPlanReminderSystem {
    HashMap<String, UserAccount> accounts;
    HashMap<String, Task> taskMap;
    TaskLinkedList taskList;
    ActionStack undoStack;
    NotificationQueue notificationQueue;
    Scanner sc;
    UserAccount currentUser;

    WorkPlanReminderSystem() {
        accounts = new HashMap<>();
        taskMap = new HashMap<>();
        taskList = new TaskLinkedList();
        undoStack = new ActionStack();
        notificationQueue = new NotificationQueue();
        sc = new Scanner(System.in);

        loadDefaultAccounts();
        loadSampleTasks();
    }

    void loadDefaultAccounts() {
        accounts.put("admin", new UserAccount("admin", "1234", "Admin"));
        accounts.put("student", new UserAccount("student", "pass", "Student"));
        accounts.put("demo", new UserAccount("demo", "demo", "Demo User"));
    }

    void loadSampleTasks() {
        addTaskDirect(new Task(generateTaskId(), "Complete project proposal", "high",
                "2026-03-12", "14:30", "Finish and review the proposal", "Work", Arrays.asList(5, 15)));

        addTaskDirect(new Task(generateTaskId(), "Gym session", "medium",
                "2026-03-12", "06:00", "Morning workout", "Exercise", Arrays.asList(5)));

        addTaskDirect(new Task(generateTaskId(), "Study DSA", "high",
                "2026-03-12", "20:00", "Revise linked list, stack, queue", "Study", Arrays.asList(10, 20)));
    }

    void addTaskDirect(Task task) {
        taskList.append(task);
        taskMap.put(task.id, task);
    }

    String generateTaskId() {
        return "TASK" + (System.currentTimeMillis() % 100000);
    }

    boolean login(String username, String password) {
        UserAccount account = accounts.get(username);
        if (account != null && account.password.equals(password)) {
            currentUser = account;
            System.out.println("Login successful. Welcome, " + account.fullName + "!");
            return true;
        }
        System.out.println("Invalid credentials.");
        return false;
    }

    void registerUser() {
        System.out.print("Enter full name: ");
        String name = sc.nextLine();

        System.out.print("Enter username: ");
        String username = sc.nextLine().toLowerCase();

        if (accounts.containsKey(username)) {
            System.out.println("Username already exists.");
            return;
        }

        System.out.print("Enter password: ");
        String password = sc.nextLine();

        accounts.put(username, new UserAccount(username, password, name));
        System.out.println("Account created successfully.");
    }

    void addTask() {
        System.out.print("Task name: ");
        String name = sc.nextLine();

        System.out.print("Priority (high/medium/low): ");
        String priority = sc.nextLine();

        System.out.print("Date (YYYY-MM-DD): ");
        String date = sc.nextLine();

        System.out.print("Time (HH:MM): ");
        String time = sc.nextLine();

        System.out.print("Description: ");
        String description = sc.nextLine();

        System.out.print("Category: ");
        String category = sc.nextLine();

        System.out.print("How many reminder intervals? ");
        int n = Integer.parseInt(sc.nextLine());
        List<Integer> reminders = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            System.out.print("Enter reminder " + (i + 1) + " in minutes: ");
            reminders.add(Integer.parseInt(sc.nextLine()));
        }

        Task task = new Task(generateTaskId(), name, priority, date, time, description, category, reminders);
        addTaskDirect(task);

        undoStack.pushAction("Added task: " + task.name);
        notificationQueue.addNotification("New task added: " + task.name);

        System.out.println("Task added successfully.");
    }

    void completeTask() {
        System.out.print("Enter task ID to complete: ");
        String id = sc.nextLine();

        Task task = taskMap.get(id);
        if (task == null) {
            System.out.println("Task not found.");
            return;
        }

        task.completed = true;
        task.completedAt = new Date().toString();
        undoStack.pushAction("Completed task: " + task.name);
        notificationQueue.addNotification("Task completed: " + task.name);

        System.out.println("Task marked as completed.");
    }

    void deleteTask() {
        System.out.print("Enter task ID to delete: ");
        String id = sc.nextLine();

        Task task = taskMap.get(id);
        if (task == null) {
            System.out.println("Task not found.");
            return;
        }

        taskList.remove(id);
        taskMap.remove(id);
        undoStack.pushAction("Deleted task: " + task.name);
        notificationQueue.addNotification("Task deleted: " + task.name);

        System.out.println("Task deleted successfully.");
    }

    void searchTask() {
        System.out.print("Enter task ID to search: ");
        String id = sc.nextLine();

        Task task = taskList.searchById(id);
        if (task == null) {
            System.out.println("Task not found.");
        } else {
            task.display();
        }
    }

    void sortTasks() {
        List<Task> activeTasks = taskList.toArray();

        System.out.println("1. Sort by Name");
        System.out.println("2. Sort by Priority");
        System.out.println("3. Sort by Date");
        System.out.print("Choose sort option: ");
        String ch = sc.nextLine();

        Comparator<Task> comp;

        switch (ch) {
            case "1":
                comp = Comparator.comparing(t -> t.name.toLowerCase());
                break;
            case "2":
                comp = Comparator.comparingInt(t -> priorityValue(t.priority));
                break;
            case "3":
                comp = Comparator.comparing(t -> t.date + " " + t.time);
                break;
            default:
                System.out.println("Invalid choice.");
                return;
        }

        List<Task> sorted = MergeSorter.mergeSort(activeTasks, comp);

        System.out.println("\nSorted Tasks:");
        for (Task t : sorted) {
            t.display();
        }
    }

    int priorityValue(String p) {
        if (p.equalsIgnoreCase("high")) return 1;
        if (p.equalsIgnoreCase("medium")) return 2;
        return 3;
    }

    void showAnalytics() {
        List<Task> all = taskList.toArray();
        int total = all.size();
        int completed = 0;
        int pending = 0;
        int high = 0, medium = 0, low = 0;

        for (Task t : all) {
            if (t.completed) completed++;
            else pending++;

            if (t.priority.equalsIgnoreCase("high")) high++;
            else if (t.priority.equalsIgnoreCase("medium")) medium++;
            else low++;
        }

        System.out.println("\n===== ANALYTICS =====");
        System.out.println("Total Tasks     : " + total);
        System.out.println("Completed Tasks : " + completed);
        System.out.println("Pending Tasks   : " + pending);
        System.out.println("High Priority   : " + high);
        System.out.println("Medium Priority : " + medium);
        System.out.println("Low Priority    : " + low);
    }

    void showMenu() {
        while (true) {
            System.out.println("\n===== WORK PLAN REMINDER MENU =====");
            System.out.println("1. Add Task");
            System.out.println("2. Show Active Tasks");
            System.out.println("3. Show Completed Tasks");
            System.out.println("4. Complete Task");
            System.out.println("5. Delete Task");
            System.out.println("6. Search Task");
            System.out.println("7. Sort Tasks (Merge Sort)");
            System.out.println("8. Show Analytics");
            System.out.println("9. Show Notifications");
            System.out.println("10. Process Next Notification");
            System.out.println("11. Undo Last Action");
            System.out.println("12. Show Action History");
            System.out.println("13. Exit");
            System.out.print("Enter choice: ");

            String choice = sc.nextLine();

            switch (choice) {
                case "1":
                    addTask();
                    break;
                case "2":
                    taskList.displayAllActive();
                    break;
                case "3":
                    taskList.displayCompleted();
                    break;
                case "4":
                    completeTask();
                    break;
                case "5":
                    deleteTask();
                    break;
                case "6":
                    searchTask();
                    break;
                case "7":
                    sortTasks();
                    break;
                case "8":
                    showAnalytics();
                    break;
                case "9":
                    notificationQueue.showNotifications();
                    break;
                case "10":
                    notificationQueue.processNextNotification();
                    break;
                case "11":
                    undoStack.undoLastAction();
                    break;
                case "12":
                    undoStack.showHistory();
                    break;
                case "13":
                    System.out.println("Exiting system...");
                    return;
                default:
                    System.out.println("Invalid choice.");
            }
        }
    }

    void start() {
        System.out.println("===== INDIVIDUAL WORK PLAN REMINDER MODULE =====");
        System.out.println("1. Login");
        System.out.println("2. Register");
        System.out.print("Choose option: ");
        String ch = sc.nextLine();

        if (ch.equals("2")) {
            registerUser();
        }

        System.out.print("Username: ");
        String username = sc.nextLine();

        System.out.print("Password: ");
        String password = sc.nextLine();

        if (login(username, password)) {
            showMenu();
        }
    }
}

public class Main {
    public static void main(String[] args) {
        WorkPlanReminderSystem system = new WorkPlanReminderSystem();
        system.start();
    }
}