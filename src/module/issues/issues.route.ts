import { Router } from "express";
import { IssuesController } from "./issues.controller";
const router = Router();

router.post('/issues',IssuesController.createIssues)
router.get('/issues',IssuesController.getAllIssues)



export const issuesRoute = router;