import { Router } from "express";

// import Tutor from "../models/tutor.model";
// import Student from "../models/student.model";

// import {
//     validateRegisterUser,
//     isTutorLogin,
//     isStudentLogin,
//     isAdminLogin,
//   } from "@envy-core/common";

import ChatController from "../controllers/chat.controller";

import ChatService from "../services/chat.services";

import ChatRepository from "../repositories/chat.repository";

import Chat from "../models/chat.model";

import Message from "../models/message.model";

export const chatRepository = new ChatRepository(Chat, Message);

const chatService = new ChatService(chatRepository, Chat);

const chatController = new ChatController(chatService);

const router = Router();

router.post("/fetch-chats", chatController.fetchUsersWithExistingChats);
router.post("/create-chat", chatController.createChatRoom);
router.post("/messages", chatController.fetchChatHistory);

export default router;
