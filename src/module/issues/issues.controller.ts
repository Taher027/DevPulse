import type { Request, Response } from "express";
import { IssuesService } from "./issues.service";
import { pool } from "../../db";
import type { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/sendResponse";

const createIssues =async (req:Request, res:Response) =>{
    console.log('from controller: ', req?.user)

   try{
          const result = await IssuesService.createIssesToDB(req.body);
       
      
      res.status(201).json({
          status:"success",
          message:"issue created successfully",
          data: result
      })
      }catch(error:any){
               res.status(400).json({
                  status: false,
                  message: error.message,
                   error:error
               })
      }
   

}

const getAllIssues = async (req: Request, res: Response) => {
    
    try {
        const issues = await IssuesService.getAllIssuesFromDB(req.query);


        if(issues.length === 0){
            return sendResponse(res, {
            statusCode: 404,
            success: false,
            message: "No issues found !"
            }
         )
        }


        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues retrieved successfully",
            data: issues,
            }
         )

       
    } catch (error: any) {

          sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
            }
         )
    }
};
const getSingleIssue = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const issue = await IssuesService.getSingleIssuesFromDB(id as string);


        if(issue.rows.length === 0){
            return res.status(404).json({
                status: false,
                message: "No issues found!"
            });
        }

          sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues retrieved successfully",
            data: issue.rows[0],
            }
         )

    } catch (error: any) {
        res.status(500).json({
            status: false,
            message: error.message,
            error: error
        });
    }
};

const updateIssue = async (req: Request, res: Response) =>{
    const {id} = req.params;
    const user = req.user;
    const {title, description, type, status} = req.body;

    try {
        const updatedIssue = await IssuesService.updateIssuesToDB(id as string, req.body, user as JwtPayload);

        if(updatedIssue.length === 0){
            return res.status(404).json({
                status: false,
                message: "Issue not found!"
            });
        }
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User Created successfully!",
            data: updatedIssue,
            }
         )

        
    } catch (error: any) {
       sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
            }
         )
    }
        
}

const deleteIssue =async (req: Request, res: Response) =>{
    const {id} = req.params;
    try{
        const result = await IssuesService.deleteIssuesFromDB(id as string);
          sendResponse(res, {
            statusCode: 20,
            success: true,
            message: "User deleted successfull!",
            }
         )

    }catch(error:any){
      sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
            }
         )
    }
}


export const IssuesController ={
    createIssues,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue

}