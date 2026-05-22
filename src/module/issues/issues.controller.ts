import type { Request, Response } from "express";
import { IssuesService } from "./issues.service";
import { pool } from "../../db";

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
            return res.status(404).json({
                status: false,
                message: "No issues found!"
            });
        }
        res.status(200).json({
            status: "success",
            message: "Issues retrieved successfully",
            data: issues
        });
    } catch (error: any) {
        res.status(500).json({
            status: false,
            message: error.message,
            error: error
        });
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
        res.status(200).json({
            status: "success",
            message: "Issues retrieved successfully",
            data: issue.rows[0]
        });
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
    const {title, description, type, status} = req.body;

    try {
        const updatedIssue = await IssuesService.updateIssuesToDB(id as string, req.body);
        console.log('in controller update: ', updatedIssue);
        res.status(200).json({
            status: "success",
            message: "Issue updated successfully",
            data: updatedIssue
        });
    } catch (error: any) {
        res.status(500).json({
            status: false,
            message: error.message,
            error: error
        });
    }
        
}

const deleteIssue =async (req: Request, res: Response) =>{
    const {id} = req.params;
    try{
        const result = await IssuesService.deleteIssuesFromDB(id as string);
        console.log(result)
        res.status(200).json({
            status: "success",
            message: "Issue deleted successfully",
        });

    }catch(error:any){
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}


export const IssuesController ={
    createIssues,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue

}