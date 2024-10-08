import { Router } from "express";
import { deleteSessionById, getSessionsByUser } from "../../db/sessionsModel";
import { requireAuth } from "../middlewares/requireAuth";
import { sendMessageToUser } from "../../wsServer/wsServer";
import { logger } from "../../utils/logger";

const router = Router();

router.get("/sessions", requireAuth, async (req, res) => {
	try {
		const sessions = await getSessionsByUser(req.user!._id);
		res.json({ data: sessions });
	} catch (error) {
		logger.error(error, "Error in /sessions GET route");
		res.status(500).json({ error });
	}
});

router.delete("/sessions", requireAuth, async (req, res) => {
	try {
		const sessionId = req.body.sessionId as string;

		const rowsDeleted: number = await deleteSessionById(req.user!._id, sessionId);

		// Send message back to extension
		const message = JSON.stringify({ type: "SESSION_REMOVE" });
		sendMessageToUser(req.user!._id, sessionId, message);

		res.json({ data: rowsDeleted });
	} catch (error) {
		logger.error("Error in /sessions DELETE route");
		res.status(500).json({ error });
	}
});

export default router;
