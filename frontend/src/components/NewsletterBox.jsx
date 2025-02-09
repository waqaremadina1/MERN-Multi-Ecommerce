import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (email.trim() === "") {
      toast.error("Please enter your email!");
    } else {
      toast.success("Thanks For Subscribe Us");
      setEmail(""); // Email field clear karna
    }
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Subscribe now and get 20% off on your first purchase. Limited time offer, hurry up!
      </p>
      <form onSubmit={onSubmitHandler} className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3">
        <input
          className="w-full sm:flex-1 outline-none"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="bg-black text-white text-xs px-10 py-4 cursor-pointer">
          SUBSCRIBE
        </button>
      </form>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default NewsletterBox;
