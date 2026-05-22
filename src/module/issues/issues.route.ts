import { Router } from "express";
import { IssuesController } from "./issues.controller";
const router = Router();

router.post('/issues',IssuesController.createIssues)
router.put('/issues/:id',IssuesController.updateIssue)
router.get('/issues',IssuesController.getAllIssues)
router.get('/issues/:id',IssuesController.getSingleIssue)
router.delete('/issues/:id',IssuesController.deleteIssue)



export const issuesRoute = router;