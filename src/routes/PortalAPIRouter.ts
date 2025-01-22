import { Router } from "express";
import PortalAPIController from "../modules/client-api-portal/controller/PortalAPIController";

const router: Router = Router();

router.get("/update", PortalAPIController.updateDB);

export default router;