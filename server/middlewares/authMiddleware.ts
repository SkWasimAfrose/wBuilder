import { Request, Response, NextFunction } from 'express'; // [1]
import { auth } from '../lib/auth.js'; // [2]
import { fromNodeHeaders } from "better-auth/node"; // [2]

export const protect = async (req: Request, res: Response, next: NextFunction) => { // [1]
    try {
        // Retrieve the session using headers provided by the client
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        }); // [2]

        // Check if session or user exists
        if (!session || !session.user) {
            return res.status(401).json({ message: "Unauthorized" }); // [3]
        }

        // Attach the User to the request object for controllers to use
        req.user = session.user; // [3]

        next(); // [3]

    } catch (error) {
        console.log(error); // [3]
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
// Required Configuration (TypeScript)
// To make req.userId = session.user.id work without TypeScript errors, the transcript notes you must extend the Express Request interface. You should have a type definition file located at server/types/express.d.ts:
// server/types/express.d.ts
// import { Request } from "express"; // [4]
// declare global {
//     namespace Express {
//         interface Request {
//             userId?: string; // [4]
//         }
//     }
// }
