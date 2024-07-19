"use server";
import { revalidatePath } from "next/cache";
import { revalidate } from "../about/page";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be signed in to update your profile");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Invalid national ID");

  const updateData = { nationality, countryFlag, nationalID };

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId)
    .select()
    .single();

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

export async function createReservation(bookingData, formData) {
  console.log(formData);
  const session = await auth();
  if (!session)
    throw new Error("You must be signed in to create a reservation");

  console.log(formData);

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: +formData.get("numGuests"),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };
  const { error } = await supabase.from("bookings").insert([newBooking]);
  // So that the newly created object gets returned!

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session)
    throw new Error("You must be signed in to delete a reservation");

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId)) {
    throw new Error("You are not allowed to delete this booking");
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Reservation could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateBooking(formData) {
  // 1) Authentication
  const session = await auth();

  if (!session)
    throw new Error("You must be signed in to update a reservation");

  //2) Authorization
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);
  const bookingId = +formData.get("bookingId");

  if (!guestBookingsIds.includes(bookingId)) {
    throw new Error("You are not allowed to delete this booking");
  }
  // 3) Building update data
  const updateData = {
    numGuests: +formData.get("numGuests"),
    observations: formData.get("observations").slice(0, 1000),
  };

  // 4) Updating
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select();

  // 5) Handling errors
  if (error) throw new Error("Reservation could not be updated");
  // 6) Revalidating the cache
  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
