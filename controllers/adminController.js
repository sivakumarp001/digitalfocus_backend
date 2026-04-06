const User = require('../models/User');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');
const FocusSession = require('../models/FocusSession');
const ReTestRequest = require('../models/ReTestRequest');

const questionPool = {
    mathematics: [
        { question: 'What is 15 + 27?', options: ['40', '42', '41', '43'], correctAnswer: 1 },
        { question: 'What is the square root of 144?', options: ['10', '12', '14', '13'], correctAnswer: 1 },
        { question: 'What is 25 multiplied by 4?', options: ['99', '100', '101', '102'], correctAnswer: 1 },
        { question: 'What is 100 divided by 5?', options: ['19', '20', '21', '25'], correctAnswer: 1 },
        { question: 'What is 50% of 200?', options: ['90', '100', '110', '120'], correctAnswer: 1 },
        { question: 'What is the LCM of 12 and 18?', options: ['24', '30', '36', '42'], correctAnswer: 2 },
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
};

const buildQuestionSet = (subject, minimumCount = 50) => {
    const pool = questionPool[(subject || 'mathematics').toLowerCase()] || questionPool.mathematics;
    const questions = [];

    while (questions.length < minimumCount) {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        shuffled.forEach((question, index) => {
            if (questions.length < minimumCount) {
                questions.push({
                    ...question,
                    question: `${question.question} [${Math.floor(questions.length / pool.length) + 1}-${index + 1}]`,
                });
            }
        });
    }

    return questions.slice(0, minimumCount);
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password').sort({ cumulativePoints: -1, createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        next(error);
    }
};

const getUserDetail = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        const [totalTasks, completedTasks, focusSessions, quizzes] = await Promise.all([
            Task.countDocuments({ user: user._id }),
            Task.countDocuments({ user: user._id, completed: true }),
            FocusSession.countDocuments({ user: user._id, mode: 'work', completed: true }),
            Quiz.find({ userId: user._id, status: 'completed' }).sort({ completedAt: -1 }).limit(10),
        ]);

        res.json({
            success: true,
            user,
            stats: {
                totalTasks,
                completedTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                focusSessions,
                totalFocusMinutes: user.totalFocusMinutes,
                cumulativePoints: user.cumulativePoints,
                recentScores: quizzes,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getStudentTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.params.id }).populate('linkedQuizId').sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    } catch (error) {
        next(error);
    }
};

const assignQuizToTask = async (req, res, next) => {
    try {
        const { subject, generateNew = true } = req.body;
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const topic = (subject || task.requiredLanguage || 'mathematics').toLowerCase();
        const releaseTime = task.endTime || task.dueDate || new Date();
        let quiz;

        if (generateNew) {
            quiz = await Quiz.create({
                userId: task.user,
                linkedTaskId: task._id,
                subject: topic,
                title: `${task.title} Test`,
                questions: buildQuestionSet(topic, 50),
                totalQuestions: 50,
                timeLimit: 60,
                quizType: 'assigned',
                assignedBy: req.user._id,
                availableAt: releaseTime,
            });
        } else {
            quiz = await Quiz.findOne({
                userId: task.user,
                subject: topic,
                quizType: 'assigned',
            }).sort({ createdAt: -1 });

            if (!quiz) {
                res.status(404);
                throw new Error(`No existing quiz found for subject: ${topic}`);
            }

            quiz.availableAt = releaseTime;
            quiz.linkedTaskId = task._id;
            quiz.assignedBy = req.user._id;
            quiz.quizType = 'assigned';
            await quiz.save();
        }

        task.linkedQuizId = quiz._id;
        task.quizRequired = true;
        task.assignedByStaff = true;
        task.assignedBy = req.user._id;
        task.taskQuizAvailableAt = releaseTime;
        task.requiredLanguage = topic;
        await task.save();

        res.json({
            success: true,
            message: 'Test assigned to task successfully',
            task: await task.populate('linkedQuizId'),
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        await Task.deleteMany({ user: user._id });
        await FocusSession.deleteMany({ user: user._id });
        await Quiz.deleteMany({ userId: user._id });
        await user.deleteOne();

        res.json({ success: true, message: 'User and associated data removed' });
    } catch (error) {
        next(error);
    }
};

const getReports = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password');
        const reports = await Promise.all(users.map(async (user) => {
            const [total, completed, sessions, quizzes] = await Promise.all([
                Task.countDocuments({ user: user._id }),
                Task.countDocuments({ user: user._id, completed: true }),
                FocusSession.countDocuments({ user: user._id, mode: 'work', completed: true }),
                Quiz.find({ userId: user._id, status: 'completed' }),
            ]);

            const averageScore = quizzes.length
                ? Math.round(quizzes.reduce((sum, quiz) => sum + quiz.percentage, 0) / quizzes.length)
                : 0;

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                streak: user.streak,
                productivityScore: user.productivityScore,
                cumulativePoints: user.cumulativePoints || 0,
                totalTasks: total,
                completedTasks: completed,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                focusSessions: sessions,
                totalFocusMinutes: user.totalFocusMinutes,
                averageScore,
                quizzesTaken: quizzes.length,
                joinedAt: user.createdAt,
            };
        }));

        const leaderboard = [...reports]
            .sort((a, b) => b.cumulativePoints - a.cumulativePoints || b.averageScore - a.averageScore)
            .slice(0, 10)
            .map((item, index) => ({
                rank: index + 1,
                _id: item._id,
                name: item.name,
                cumulativePoints: item.cumulativePoints,
                averageScore: item.averageScore,
                completionRate: item.completionRate,
            }));

        res.json({ success: true, reports, leaderboard });
    } catch (error) {
        next(error);
    }
};

const getLeaderboard = async (req, res, next) => {
    try {
        const { limit = 10, period = 'all' } = req.query;

        let students = await User.find({ role: 'student' })
            .select('name email cumulativePoints streak totalFocusMinutes productivityScore scoreHistory')
            .lean();

        students = students.map((student) => ({
            ...student,
            cumulativePoints: Number(student.cumulativePoints || 0),
            streak: Number(student.streak || 0),
            totalFocusMinutes: Number(student.totalFocusMinutes || 0),
            productivityScore: Number(student.productivityScore || 0),
            scoreHistory: Array.isArray(student.scoreHistory) ? student.scoreHistory : [],
        }));

        if (period !== 'all') {
            const date = new Date();
            let startDate = new Date();
            
            if (period === 'week') {
                startDate.setDate(date.getDate() - 7);
            } else if (period === 'month') {
                startDate.setMonth(date.getMonth() - 1);
            }

            students = students.map(student => {
                const recentScores = student.scoreHistory.filter((score) => {
                    if (!score?.takenAt) return false;
                    return new Date(score.takenAt) >= startDate;
                });
                const periodPoints = recentScores.reduce((sum, score) => sum + (score.pointsDelta || 0), 0);
                const periodAverage = recentScores.length > 0
                    ? Math.round(recentScores.reduce((sum, score) => sum + score.percentage, 0) / recentScores.length)
                    : 0;

                return {
                    ...student,
                    displayPoints: periodPoints,
                    displayAverage: periodAverage,
                };
            });
        } else {
            students = students.map(student => ({
                ...student,
                displayPoints: student.cumulativePoints,
                displayAverage: student.scoreHistory.length > 0
                    ? Math.round(student.scoreHistory.reduce((sum, score) => sum + score.percentage, 0) / student.scoreHistory.length)
                    : 0,
            }));
        }

        const leaderboard = students
            .sort((a, b) => {
                if (b.displayPoints !== a.displayPoints) {
                    return b.displayPoints - a.displayPoints;
                }
                return b.displayAverage - a.displayAverage;
            })
            .slice(0, parseInt(limit))
            .map((student, index) => ({
                rank: index + 1,
                _id: student._id,
                name: student.name,
                email: student.email,
                cumulativePoints: period === 'all' ? student.cumulativePoints : student.displayPoints,
                streak: student.streak,
                productivityScore: student.productivityScore,
                totalFocusHours: Math.round(student.totalFocusMinutes / 60),
                quizzesTaken: student.scoreHistory.length,
                averageScore: student.displayAverage,
                periodPoints: student.displayPoints,
            }));

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        next(error);
    }
};

const getRetestRequests = async (req, res, next) => {
    try {
        const { status = 'pending', limit = 50 } = req.query;

        const query = status ? { status } : {};
        
        const requests = await ReTestRequest.find(query)
            .populate('studentId', 'name email')
            .populate('quizId', 'subject title score percentage')
            .populate('taskId', 'title')
            .sort({ requestedAt: -1 })
            .limit(parseInt(limit));

        res.json({ success: true, data: requests });
    } catch (error) {
        next(error);
    }
};

const approveRetest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { approvalReason = '' } = req.body;

        const request = await ReTestRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Retest request not found' });
        }

        request.status = 'approved';
        request.approvedBy = req.user._id;
        request.approvalReason = approvalReason;
        request.approvalDate = new Date();
        await request.save();

        if (request.quizId) {
            const originalQuiz = await Quiz.findById(request.quizId);

            if (!originalQuiz) {
                return res.status(404).json({ message: 'Original quiz not found for this retest request' });
            }

            const retakeQuiz = await Quiz.create({
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

            await Quiz.findByIdAndUpdate(originalQuiz._id, {
                reTestRequested: false,
                reTestRequestId: null,
            });

            if (request.taskId) {
                await Task.findByIdAndUpdate(request.taskId, {
                    linkedQuizId: retakeQuiz._id,
                    quizCompleted: false,
                    quizPassedAt: null,
                    completed: false,
                    completedAt: null,
                    reTestRequested: false,
                    reTestRequestId: null,
                    $inc: { reTestApprovedCount: 1 },
                });
            }
        }

        res.json({
            success: true,
            data: request,
            message: 'Retest request approved. A fresh retake quiz is now available for the student.',
        });
    } catch (error) {
        next(error);
    }
};

const rejectRetest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { approvalReason = 'Request denied by staff' } = req.body;

        const request = await ReTestRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Retest request not found' });
        }

        request.status = 'rejected';
        request.approvedBy = req.user._id;
        request.approvalReason = approvalReason;
        request.approvalDate = new Date();
        await request.save();

        // Clear retest flag from quiz and task
        if (request.quizId) {
            await Quiz.findByIdAndUpdate(request.quizId, {
                reTestRequested: false,
                reTestRequestId: null,
            });
        }

        if (request.taskId) {
            await Task.findByIdAndUpdate(request.taskId, {
                reTestRequested: false,
                reTestRequestId: null,
            });
        }

        res.json({
            success: true,
            data: request,
            message: 'Retest request rejected.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllUsers, getUserDetail, getStudentTasks, assignQuizToTask, deleteUser, getReports, getLeaderboard, getRetestRequests, approveRetest, rejectRetest };
