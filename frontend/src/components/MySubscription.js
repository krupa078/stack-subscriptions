import React, { useEffect, useState } from "react";
import api from "../api";

function MySubscription({ userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/subscription/${userId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [userId]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2>My Subscription</h2>

      <p>
        <b>Plan:</b> {data.plan.name}
      </p>

      <p>
        <b>Price:</b> ₹{data.plan.price}
      </p>

      <p>
        <b>Questions/day:</b>{" "}
        {data.plan.questionLimitPerDay === null
          ? "Unlimited"
          : data.plan.questionLimitPerDay}
      </p>

      {data.subscription && (
        <>
          <p>
            <b>Started:</b> {data.subscription.startedAt}
          </p>
          <p>
            <b>Expires:</b> {data.subscription.expiresAt || "Never"}
          </p>
        </>
      )}
    </div>
  );
}

export default MySubscription;
