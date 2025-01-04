"use client";

import * as React from "react";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ConfigurationModal } from "@/components/modals/configuration-modal";

export function ConfigureButton() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setShowModal(true)}>
        <Settings2 />
      </Button>
      <ConfigurationModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
