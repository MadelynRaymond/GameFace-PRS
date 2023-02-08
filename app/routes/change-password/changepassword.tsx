import type { Password, User } from '@prisma/client'
import { LoaderArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";

import { requireUser } from "~/session.server";
import {changePassword, getUserByEmail, getUserById, verifyLogin } from '~/models/user.server';


export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  }).refine((data) => data.newPassword === data.confirmPassword, 'Passwords must match')
  

  export async function loader({ request }: LoaderArgs) {
    
    // const { username, id } = await requireUser(request)
    // const userId = id
    // const password = 'mynewpassword';
    // const getPassword = await changePassword({userId, password})
    try {
        const data = await json(request);
        const validatedData = await ChangePasswordSchema.parseAsync(data);
        const { username, id } = await requireUser(request)
        const user = await getUserById(id);
        const email = await getUserByEmail(username);
        if (!user) {
          throw new Error('User not found')
        }
        const isPasswordCorrect = await verifyLogin(user.email, validatedData.currentPassword);
        if (!isPasswordCorrect) {
            throw new Error('Incorrect password')
        }
      } catch (error) {
        console.error(error)
    }
  }