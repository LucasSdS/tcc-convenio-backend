import { Router } from "express";
import ConvenioController from "../modules/api/controller/ConvenioController";

const router: Router = Router();

router.get("/convenios", ConvenioController.getAllConvenios);
router.get("/convenios/ranking", ConvenioController.rankingConvenios);

export default router;