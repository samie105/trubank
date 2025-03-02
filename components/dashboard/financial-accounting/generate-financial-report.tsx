"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/dialog-2";

export default function FinancialReport() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [report, setReport] = useState<string>("");
  const [generalLedger, setGeneralLedger] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClear = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setReport("");
    setGeneralLedger("");
    toast.success("Form cleared successfully");
  };

  const handleGenerate = () => {
    setDialogOpen(true);
  };

  const handleExport = () => {
    setDialogOpen(false);

    // Validate form
    if (!report) {
      toast.error("Please select a report type");
      return;
    }

    if (!generalLedger) {
      toast.error("Please select a general ledger");
      return;
    }

    // Generate the report based on the selected format
    toast.success(
      `Financial report generated in ${exportFormat.toUpperCase()} format`,
      {
        description: `Report period: ${format(
          startDate,
          "dd MMMM yyyy"
        )} - ${format(endDate, "dd MMMM yyyy")}`,
      }
    );

    // In a real application, you would trigger the actual export here
    console.log("Exporting report:", {
      type: report,
      startDate,
      endDate,
      generalLedger,
      format: exportFormat,
    });
  };

  return (
    <div className="containe/r mx-auto py-10">
      <Card className="max-w-3xl mx-auto border-0">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Generate</h1>
              <h1 className="text-2xl font-bold text-primary">
                Financial Report
              </h1>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report">Report</Label>
              <Select value={report} onValueChange={setReport}>
                <SelectTrigger id="report">
                  <SelectValue placeholder="Select Report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income-statement">
                    Income Statement
                  </SelectItem>
                  <SelectItem value="balance-sheet">Balance Sheet</SelectItem>
                  <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
                  <SelectItem value="trial-balance">Trial Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Period</Label>
              <div className="grid gap-4 mt-2">
                <div className="flex flex-col space-y-1">
                  <Label
                    htmlFor="startDate"
                    className="text-xs text-muted-foreground"
                  >
                    Start date
                  </Label>
                  <DateTimePicker
                    value={startDate}
                    displayFormat={{ hour24: "yyyy/MM/dd" }}
                    onChange={(date) => date && setStartDate(date)}
                    granularity="day"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <Label
                    htmlFor="endDate"
                    className="text-xs text-muted-foreground"
                  >
                    End date
                  </Label>
                  <DateTimePicker
                    value={endDate}
                    displayFormat={{ hour24: "yyyy/MM/dd" }}
                    onChange={(date) => date && setEndDate(date)}
                    granularity="day"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generalLedger">General Ledger</Label>
              <Select value={generalLedger} onValueChange={setGeneralLedger}>
                <SelectTrigger id="generalLedger">
                  <SelectValue placeholder="Select GL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense Account</SelectItem>
                  <SelectItem value="asset">Asset Account</SelectItem>
                  <SelectItem value="investment">Investment Account</SelectItem>
                  <SelectItem value="equity">Equity Account</SelectItem>
                  <SelectItem value="liability">Liability Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button
                className="bg-primary hover:bg-primary"
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResponsiveModal open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveModalContent className="sm:max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Export Format</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Choose the format for your financial report export.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <div className="py-4">
            <RadioGroup
              value={exportFormat}
              onValueChange={setExportFormat}
              className="gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal">
                  PDF Document (.pdf)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal">
                  CSV Spreadsheet (.csv)
                </Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter className="">
            <Button
              variant="outline"
              className=" mt-2 md:mt-0"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary"
              onClick={handleExport}
            >
              Export
            </Button>
          </DialogFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
