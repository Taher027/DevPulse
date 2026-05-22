import type { Request, Response } from "express";
import { IssuesService } from "./issues.service";

const createIssues =async (req:Request, res:Response) =>{

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
        const issues = await IssuesService.getAllIssuesFromDB();


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


export const IssuesController ={
    createIssues,
    getAllIssues
}