import { Router } from "express";
import { IssuesController } from "./issues.controller";
import { USER_ROLE } from "../../types";
import auth from "../../middleware/auth";
const router = Router();

router.post('/issues',auth(USER_ROLE.contributor, USER_ROLE.maintainer),IssuesController.createIssues)
router.put('/issues/:id',auth(USER_ROLE.contributor, USER_ROLE.maintainer),IssuesController.updateIssue)
router.get('/issues',IssuesController.getAllIssues)
router.get('/issues/:id',IssuesController.getSingleIssue)
router.delete('/issues/:id',auth(USER_ROLE.maintainer),IssuesController.deleteIssue)



export const issuesRoute = router