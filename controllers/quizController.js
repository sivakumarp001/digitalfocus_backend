const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Task = require('../models/Task');
const ReTestRequest = require('../models/ReTestRequest');
const asyncHandler = require('express-async-handler');

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const questionsDatabase = {
    mathematics: [
        { question: 'What is 15 + 27?', options: ['40', '42', '41', '43'], correctAnswer: 1 },
        { question: 'What is the square root of 144?', options: ['10', '12', '14', '13'], correctAnswer: 1 },
        { question: 'What is 25 multiplied by 4?', options: ['99', '100', '101', '102'], correctAnswer: 1 },
        { question: 'What is 100 divided by 5?', options: ['19', '20', '21', '25'], correctAnswer: 1 },
        { question: 'What is 50% of 200?', options: ['90', '100', '110', '120'], correctAnswer: 1 },
        { question: 'What is the LCM of 12 and 18?', options: ['24', '30', '36', '42'], correctAnswer: 2 },
    ],
    science: [
        { question: 'What is the chemical symbol for Gold?', options: ['Go', 'Au', 'Ag', 'Gd'], correctAnswer: 1 },
        { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi body'], correctAnswer: 1 },
        { question: 'How many planets are in the solar system?', options: ['7', '8', '9', '10'], correctAnswer: 1 },
        { question: 'What gas do plants absorb?', options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2 },
        { question: 'What is H2O?', options: ['Hydrogen', 'Oxygen', 'Water', 'Salt'], correctAnswer: 2 },
        { question: 'What is the pH of pure water?', options: ['6', '7', '8', '9'], correctAnswer: 1 },
    ],
    history: [
        { question: 'In which year did World War II end?', options: ['1944', '1945', '1946', '1947'], correctAnswer: 1 },
        { question: 'Who was the first President of the United States?', options: ['John Adams', 'George Washington', 'Thomas Jefferson', 'Abraham Lincoln'], correctAnswer: 1 },
        { question: 'When did India gain independence?', options: ['1945', '1946', '1947', '1948'], correctAnswer: 2 },
        { question: 'Who invented the printing press?', options: ['Newton', 'Galileo', 'Gutenberg', 'Edison'], correctAnswer: 2 },
        { question: 'Which wall fell in 1989?', options: ['Great Wall', 'Berlin Wall', 'Hadrian Wall', 'Wailing Wall'], correctAnswer: 1 },
        { question: 'Who led the Mauryan Empire?', options: ['Ashoka', 'Chandragupta Maurya', 'Harsha', 'Akbar'], correctAnswer: 1 },
    ],
    english: [
        { question: 'What is the plural of child?', options: ['Childs', 'Childes', 'Children', 'Childrens'], correctAnswer: 2 },
        { question: 'Who wrote Romeo and Juliet?', options: ['Shakespeare', 'Austen', 'Dickens', 'Twain'], correctAnswer: 0 },
        { question: 'What does candid mean?', options: ['Bright', 'Honest', 'Loud', 'Harsh'], correctAnswer: 1 },
        { question: 'Which word is a noun?', options: ['Run', 'Beautiful', 'Happiness', 'Quickly'], correctAnswer: 2 },
        { question: 'What is an antonym of happy?', options: ['Joyful', 'Sad', 'Excited', 'Glad'], correctAnswer: 1 },
        { question: 'What is a metaphor?', options: ['A direct comparison', 'A question', 'A command', 'A rhyme'], correctAnswer: 0 },
    ],
    aptitude: [
        { question: 'What is 20% of 150?', options: ['20', '25', '30', '35'], correctAnswer: 2 },
        { question: 'What is the next number: 2, 4, 8, 16?', options: ['18', '24', '30', '32'], correctAnswer: 3 },
        { question: 'If x + 5 = 12, what is x?', options: ['5', '6', '7', '8'], correctAnswer: 2 },
        { question: 'What is the average of 10, 20, 30?', options: ['15', '20', '25', '30'], correctAnswer: 1 },
        { question: 'If a train moves at 60 km/h for 2 hours, what distance is covered?', options: ['100', '110', '120', '130'], correctAnswer: 2 },
        { question: 'Simplify the ratio 45:100.', options: ['9:20', '5:11', '4:9', '3:7'], correctAnswer: 0 },
    ],
    java: [
        { question: 'Which keyword creates a class in Java?', options: ['Class', 'class', 'CLASS', 'java'], correctAnswer: 1 },
        { question: 'What is the default int value in Java?', options: ['0', '1', 'null', 'undefined'], correctAnswer: 0 },
        { question: 'Which is not a primitive type?', options: ['int', 'boolean', 'String', 'char'], correctAnswer: 2 },
        { question: 'What does JVM stand for?', options: ['Java Variable Machine', 'Java Virtual Machine', 'Java Verified Method', 'Java Visual Mode'], correctAnswer: 1 },
        { question: 'Which method starts a thread?', options: ['run()', 'execute()', 'start()', 'begin()'], correctAnswer: 2 },
        { question: 'Which package is imported by default?', options: ['java.io', 'java.util', 'java.lang', 'java.net'], correctAnswer: 2 },
    ],
    python: [
        { question: 'What is the extension of a Python file?', options: ['.python', '.py', '.pt', '.px'], correctAnswer: 1 },
        { question: 'Which keyword defines a function?', options: ['function', 'func', 'def', 'define'], correctAnswer: 2 },
        { question: 'What is 2 ** 3 in Python?', options: ['5', '6', '8', '9'], correctAnswer: 2 },
        { question: 'Which data type is immutable?', options: ['list', 'tuple', 'dict', 'set'], correctAnswer: 1 },
        { question: 'Which loop runs while a condition is true?', options: ['for', 'loop', 'while', 'repeat'], correctAnswer: 2 },
        { question: 'What does len() return?', options: ['Type', 'Length', 'Index', 'Boolean'], correctAnswer: 1 },
    ],
    c: [
        { question: 'Who created C?', options: ['Bjarne Stroustrup', 'Dennis Ritchie', 'James Gosling', 'Guido van Rossum'], correctAnswer: 1 },
        { question: 'What is the file extension of a C source file?', options: ['.cpp', '.java', '.py', '.c'], correctAnswer: 3 },
        { question: 'Which header is used for standard input/output?', options: ['stdlib.h', 'stdio.h', 'string.h', 'math.h'], correctAnswer: 1 },
        { question: 'Which symbol is used for pointers?', options: ['&', '*', '#', '@'], correctAnswer: 1 },
        { question: 'What does malloc do?', options: ['Frees memory', 'Allocates memory', 'Copies memory', 'Clears memory'], correctAnswer: 1 },
        { question: 'Which loop checks condition before running?', options: ['do-while', 'while', 'repeat', 'each'], correctAnswer: 1 },
    ],
    'c++': [
        { question: 'Who created C++?', options: ['Dennis Ritchie', 'Bjarne Stroustrup', 'James Gosling', 'Guido van Rossum'], correctAnswer: 1 },
        { question: 'Which extension is used for C++ source files?', options: ['.c', '.cpp', '.hpp', '.ccp'], correctAnswer: 1 },
        { question: 'Which concept allows multiple functions with the same name?', options: ['Encapsulation', 'Polymorphism', 'Abstraction', 'Inheritance'], correctAnswer: 1 },
        { question: 'Which keyword is used to create an object instance?', options: ['malloc', 'new', 'create', 'alloc'], correctAnswer: 1 },
        { question: 'Which header is used for input/output streams?', options: ['<stdio.h>', '<iostream>', '<stream.h>', '<io.h>'], correctAnswer: 1 },
        { question: 'Which operator is overloaded for object assignment by default?', options: ['+', '=', '==', '->'], correctAnswer: 1 },
    ],
    react: [
        { question: 'What is React primarily used for?', options: ['Backend APIs', 'Database design', 'Building UI components', 'Testing'], correctAnswer: 2 },
        { question: 'Which hook replaces lifecycle methods like componentDidMount?', options: ['useContext', 'useEffect', 'useMemo', 'useRef'], correctAnswer: 1 },
        { question: 'What is JSX?', options: ['JSON in XML', 'A CSS preprocessor', 'JavaScript + XML syntax', 'A testing library'], correctAnswer: 2 },
        { question: 'How do you pass data to a child component?', options: ['contexts', 'props', 'states', 'globals'], correctAnswer: 1 },
        { question: 'Which command creates a new Vite React app?', options: ['npm create vite@latest', 'npx react-app init', 'npm init react', 'npx create-react-app'], correctAnswer: 0 },
        { question: 'What should every list item have in React?', options: ['id attribute', 'name prop', 'key prop', 'index number'], correctAnswer: 2 },
    ],
    html: [
        { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Markdown Language', 'HyperText Machine Language', 'Home Tool Markup Language'], correctAnswer: 0 },
        { question: 'Which tag defines a paragraph?', options: ['<paragraph>', '<p>', '<para>', '<text>'], correctAnswer: 1 },
        { question: 'How do you add an image?', options: ['<image>', '<img>', '<src>', '<picture>'], correctAnswer: 1 },
        { question: 'Which tag creates a hyperlink?', options: ['<a>', '<link>', '<href>', '<url>'], correctAnswer: 0 },
        { question: 'Which tag creates a line break?', options: ['<lb>', '<br>', '<break>', '<newline>'], correctAnswer: 1 },
        { question: 'Where is metadata placed?', options: ['<footer>', '<body>', '<header>', '<head>'], correctAnswer: 3 },
    ],
    css: [
        { question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correctAnswer: 1 },
        { question: 'How do you select an element by id?', options: ['.id', '#id', '*id', ':id'], correctAnswer: 1 },
        { question: 'Which property changes text color?', options: ['font-color', 'text-color', 'color', 'foreground'], correctAnswer: 2 },
        { question: 'Which property adds space inside an element?', options: ['margin', 'padding', 'gap', 'border'], correctAnswer: 1 },
        { question: 'Which property controls font size?', options: ['font-style', 'font-size', 'text-size', 'size'], correctAnswer: 1 },
        { question: 'How do you select a class?', options: ['#class', '.class', '*class', ':class'], correctAnswer: 1 },
    ],
};

const getQuestionsForSubject = (subjectInput = '') => {
    const subjectLower = subjectInput.toLowerCase();

    if (questionsDatabase[subjectLower]) {
        return questionsDatabase[subjectLower];
    }

    const matchedKey = Object.keys(questionsDatabase).find((key) =>
        key.includes(subjectLower) || subjectLower.includes(key)
    );

    return matchedKey ? questionsDatabase[matchedKey] : questionsDatabase.mathematics;
};

const buildQuestionSet = (subject, requestedCount = 50) => {
    const availableQuestions = getQuestionsForSubject(subject);
    if (!availableQuestions.length) {
        return [];
    }

    const minimumCount = Math.max(50, Number(requestedCount) || 50);
    const selected = [];

    while (selected.length < minimumCount) {
        const round = shuffleArray(availableQuestions);
        round.forEach((question) => {
            if (selected.length >= minimumCount) return;
            selected.push({ ...question });
        });
    }

    return selected.slice(0, minimumCount);
};

const calculatePointsDelta = ({ isPassed, isPractice, task }) => {
    if (isPractice) {
        return 0;
    }

    if (isPassed) {
        return task?.pointsAwarded ?? 20;
    }

    return -Math.abs(task?.pointsPenalty ?? 10);
};

const appendScoreHistory = async ({ userId, quiz, task, isPractice, pointsDelta }) => {
    await User.findByIdAndUpdate(userId, {
        $inc: { cumulativePoints: pointsDelta },
        $push: {
            scoreHistory: {
                quizId: quiz._id,
                taskId: task?._id || null,
                subject: quiz.subject,
                score: quiz.score,
                totalQuestions: quiz.totalQuestions,
                percentage: quiz.percentage,
                passed: quiz.isPassed,
                pointsDelta,
                isPractice,
                takenAt: quiz.completedAt || new Date(),
            },
        },
    });
};

const createRetestRequestForQuiz = async ({ quiz, task, reason }) => {
    const existingPendingRequest = await ReTestRequest.findOne({
        quizId: quiz._id,
        studentId: quiz.userId,
        status: 'pending',
    });

    if (existingPendingRequest) {
        await Quiz.findByIdAndUpdate(quiz._id, {
            reTestRequested: true,
            reTestRequestId: existingPendingRequest._id,
        });

        if (task?._id) {
            await Task.findByIdAndUpdate(task._id, {
                reTestRequested: true,
                reTestRequestId: existingPendingRequest._id,
            });
        }

        return existingPendingRequest;
    }

    const retestRequest = await ReTestRequest.create({
        studentId: quiz.userId,
        quizId: quiz._id,
        taskId: task?._id || quiz.linkedTaskId || null,
        score: quiz.score,
        percentage: quiz.percentage,
        reason,
    });

    await Quiz.findByIdAndUpdate(quiz._id, {
        reTestRequested: true,
        reTestRequestId: retestRequest._id,
    });

    if (task?._id) {
        await Task.findByIdAndUpdate(task._id, {
            reTestRequested: true,
            reTestRequestId: retestRequest._id,
        });
    }

    return retestRequest;
};

const createRetakeQuizFromOriginal = async (originalQuiz) => Quiz.create({
    userId: originalQuiz.userId,
    linkedTaskId: originalQuiz.linkedTaskId,
    subject: originalQuiz.subject,
    title: `${originalQuiz.title} Retest`,
    questions: originalQuiz.questions,
    totalQuestions: originalQuiz.totalQuestions,
    timeLimit: originalQuiz.timeLimit,
    quizType: originalQuiz.quizType,
    assignedBy: originalQuiz.assignedBy,
    availableAt: new Date(),
    isPassed: false,
    answers: [],
    score: 0,
    percentage: 0,
    pointsDelta: 0,
    antiCheatWarnings: 0,
    fullscreenViolations: 0,
    tabSwitchViolations: 0,
    status: 'in-progress',
    startedAt: new Date(),
    completedAt: null,
    reTestRequested: false,
    reTestRequestId: null,
    isRetake: true,
    originalQuizId: originalQuiz._id,
});

const ensureApprovedRetakeQuizForTask = async (task) => {
    if (!task?.reTestRequestId) {
        return task;
    }

    const request = await ReTestRequest.findById(task.reTestRequestId);
    if (!request || request.status !== 'approved') {
        return task;
    }

    const currentLinkedQuiz = task.linkedQuizId ? await Quiz.findById(task.linkedQuizId) : null;
    if (currentLinkedQuiz && currentLinkedQuiz.status !== 'completed') {
        return task;
    }

    const originalQuiz = await Quiz.findById(request.quizId);
    if (!originalQuiz) {
        return task;
    }

    const retakeQuiz = await createRetakeQuizFromOriginal(originalQuiz);

    return Task.findByIdAndUpdate(
        task._id,
        {
            linkedQuizId: retakeQuiz._id,
            quizCompleted: false,
            quizPassedAt: null,
            completed: false,
            completedAt: null,
            reTestRequested: false,
            reTestRequestId: null,
            $inc: { reTestApprovedCount: 1 },
        },
        { new: true },
    );
};

exports.generateQuiz = asyncHandler(async (req, res) => {
    const { subject, numberOfQuestions = 50 } = req.body;
    const userId = req.user._id;

    if (!subject || !subject.trim()) {
        return res.status(400).json({ message: 'Subject is required' });
    }

    const selectedQuestions = buildQuestionSet(subject, numberOfQuestions);
    if (!selectedQuestions.length) {
        return res.status(400).json({ message: `No questions available for subject: ${subject}` });
    }

    const quiz = await Quiz.create({
        userId,
        subject,
        title: `${subject} Practice Test`,
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
        timeLimit: 60,
        quizType: 'practice',
        availableAt: new Date(),
    });

    res.status(201).json({ success: true, data: quiz });
});

exports.submitQuiz = asyncHandler(async (req, res) => {
    const { answers, antiCheatWarnings = 0, fullscreenViolations = 0, tabSwitchViolations = 0 } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to submit this quiz' });
    }

    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
        const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
        if (isCorrect) {
            correctCount++;
        }

        return {
            questionIndex: index,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
        };
    });

    const percentage = Math.round((correctCount / quiz.totalQuestions) * 100);
    const terminated = fullscreenViolations > 0;
    quiz.answers = processedAnswers;
    quiz.score = correctCount;
    quiz.percentage = percentage;
    quiz.isPassed = !terminated && percentage >= 60;
    quiz.pointsDelta = 0;
    quiz.antiCheatWarnings = antiCheatWarnings;
    quiz.fullscreenViolations = fullscreenViolations;
    quiz.tabSwitchViolations = tabSwitchViolations;
    quiz.status = 'completed';
    quiz.completedAt = new Date();

    await quiz.save();
    await appendScoreHistory({ userId: quiz.userId, quiz, task: null, isPractice: true, pointsDelta: 0 });

    res.json({
        success: true,
        data: quiz,
        message: terminated
            ? `Practice test terminated. Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%).`
            : `Practice test completed. Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%).`,
    });
});

exports.getQuizHistory = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: quizzes });
});

exports.getQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ success: true, data: quiz });
});

exports.deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    await Quiz.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Quiz deleted' });
});

exports.generateTaskQuiz = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    if (!task.quizRequired || !task.assignedByStaff || !task.linkedQuizId) {
        return res.status(400).json({ message: 'No staff-assigned test is available for this task' });
    }

    if (task.taskQuizAvailableAt && new Date() < task.taskQuizAvailableAt) {
        return res.status(400).json({
            message: 'The assigned test will be available after the task duration ends.',
            availableAt: task.taskQuizAvailableAt,
        });
    }

    const quiz = await Quiz.findById(task.linkedQuizId);
    if (!quiz) {
        return res.status(404).json({ message: 'Assigned test not found' });
    }

    task.taskQuizStarted = true;
    task.taskQuizStartedAt = new Date();
    await task.save();

    res.status(201).json({
        success: true,
        data: quiz,
        task,
        message: 'Assigned test is ready.',
    });
});

exports.submitTaskQuiz = asyncHandler(async (req, res) => {
    const { answers, taskId, antiCheatWarnings = 0, fullscreenViolations = 0, tabSwitchViolations = 0 } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to submit this quiz' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    const taskLinksToQuiz = task.linkedQuizId && task.linkedQuizId.toString() === req.params.id;
    const quizLinksToTask = quiz.linkedTaskId && quiz.linkedTaskId.toString() === taskId;

    if (!taskLinksToQuiz && !quizLinksToTask) {
        return res.status(400).json({ message: 'Quiz is not linked to this task' });
    }

    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
        const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
        if (isCorrect) {
            correctCount++;
        }

        return {
            questionIndex: index,
            selectedAnswer: answer.selectedAnswer,
            isCorrect,
        };
    });

    const percentage = Math.round((correctCount / quiz.totalQuestions) * 100);
    const terminated = fullscreenViolations > 0;
    const isPassed = !terminated && percentage >= 60;
    const pointsDelta = calculatePointsDelta({ isPassed, isPractice: false, task });

    quiz.answers = processedAnswers;
    quiz.score = correctCount;
    quiz.percentage = percentage;
    quiz.isPassed = isPassed;
    quiz.pointsDelta = pointsDelta;
    quiz.antiCheatWarnings = antiCheatWarnings;
    quiz.fullscreenViolations = fullscreenViolations;
    quiz.tabSwitchViolations = tabSwitchViolations;
    quiz.status = 'completed';
    quiz.completedAt = new Date();

    await quiz.save();

    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        {
            $set: {
                completed: isPassed,
                completedAt: isPassed ? new Date() : null,
                quizCompleted: isPassed,
                quizPassedAt: isPassed ? new Date() : null,
            },
        },
        { new: true },
    );

    await appendScoreHistory({
        userId: quiz.userId,
        quiz,
        task,
        isPractice: false,
        pointsDelta,
    });

    res.json({
        success: true,
        data: quiz,
        task: updatedTask,
        message: terminated
            ? `Test terminated due to fullscreen exit. Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%). You can request a retest from staff.`
            : isPassed
                ? `Test completed. Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%). Points increased by ${pointsDelta}.`
                : `Test completed. Score: ${quiz.score}/${quiz.totalQuestions} (${percentage}%). Points changed by ${pointsDelta}. You can request a retest from staff.`,
    });
});

exports.requestRetest = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to request a retest for this quiz' });
    }

    if (quiz.status !== 'completed') {
        return res.status(400).json({ message: 'Retest can only be requested after the test is completed' });
    }

    const isEligible = !quiz.isPassed || quiz.fullscreenViolations > 0;
    if (!isEligible) {
        return res.status(400).json({ message: 'Retest is only available for failed or terminated tests' });
    }

    const task = quiz.linkedTaskId ? await Task.findById(quiz.linkedTaskId) : null;

    if (quiz.reTestRequested && quiz.reTestRequestId) {
        const existingRequest = await ReTestRequest.findById(quiz.reTestRequestId);
        if (existingRequest?.status === 'pending') {
            return res.status(400).json({ message: 'A retest request is already pending for this test' });
        }
    }

    const reason = quiz.fullscreenViolations > 0
        ? `Student requested a retest after the test was terminated for fullscreen exit${task ? ` on task: ${task.title}` : ''}`
        : `Student requested a retest after scoring ${quiz.percentage}%${task ? ` on task: ${task.title}` : ''}`;

    const retestRequest = await createRetestRequestForQuiz({ quiz, task, reason });

    res.status(201).json({
        success: true,
        data: retestRequest,
        message: 'Retest request submitted to staff for approval.',
    });
});

exports.getTaskQuiz = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    if (!task.linkedQuizId) {
        return res.status(404).json({ message: 'No quiz linked to this task' });
    }

    if (task.taskQuizAvailableAt && new Date() < task.taskQuizAvailableAt) {
        return res.status(400).json({
            message: 'The assigned test will be available after the task duration ends.',
            availableAt: task.taskQuizAvailableAt,
        });
    }

    task = await ensureApprovedRetakeQuizForTask(task);

    const quiz = await Quiz.findById(task.linkedQuizId);
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ success: true, data: quiz });
});

exports.getTaskQuizStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    let task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    task = await ensureApprovedRetakeQuizForTask(task);

    res.json({
        success: true,
        data: {
            taskId: task._id,
            taskTitle: task.title,
            requiredLanguage: task.requiredLanguage,
            taskCompleted: task.completed,
            quizRequired: task.quizRequired || false,
            quizStarted: task.taskQuizStarted || false,
            quizCompleted: task.quizCompleted || false,
            linkedQuizId: task.linkedQuizId || null,
            assignedByStaff: task.assignedByStaff || false,
            availableAt: task.taskQuizAvailableAt || null,
            plannedDurationMinutes: task.plannedDurationMinutes || 0,
            canStart: Boolean(task.linkedQuizId) && (!task.taskQuizAvailableAt || new Date() >= task.taskQuizAvailableAt),
        },
    });
});
