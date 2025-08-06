import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, DollarSign, TrendingUp, Zap } from "lucide-react";

const ROICalculator = () => {
  const [monthlyPdfs, setMonthlyPdfs] = useState("");
  const [employeeCost, setEmployeeCost] = useState("");
  const [results, setResults] = useState(null);

  const calculateROI = () => {
    const pdfs = parseInt(monthlyPdfs) || 0;
    const cost = parseFloat(employeeCost) || 0;

    if (pdfs <= 0 || cost <= 0) return;

    // Cálculos baseados em estimativas de produtividade
    const manualTimePerPdf = 5; // em minutos
    const automatedTimePerPdf = 0.5; // em minutos

    const effectiveSalary = cost * 1.8; // salário + 80% de encargos
    const hourlyCost = effectiveSalary / 160;

    const monthlySavingMinutes = pdfs * (manualTimePerPdf - automatedTimePerPdf);
    const monthlySavingHours = monthlySavingMinutes / 60;

    const monthlyCostSaving = monthlySavingHours * hourlyCost;
    const annualSaving = monthlyCostSaving * 12;

    const annualSystemCost = 297 * 12;
    const netSaving = annualSaving - annualSystemCost;

    const roi = (netSaving / annualSystemCost) * 100;
    const paybackMonths = annualSystemCost / monthlyCostSaving;

    setResults({
    timeSavedMonthly: monthlySavingHours.toFixed(1),
    timeSavedAnnual: (monthlySavingHours * 12).toFixed(0),
    costSavedMonthly: monthlyCostSaving.toFixed(2),
    costSavedAnnual: annualSaving.toFixed(2),
    netSavingAnnual: netSaving.toFixed(2),
    roi: roi.toFixed(0),
    paybackMonths: paybackMonths.toFixed(1)
    });
  };

  const handleCalculate = () => {
    calculateROI();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4 px-4 py-2">
          <Calculator className="w-4 h-4 mr-2" />
          Calculadora de ROI
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Calcule o Custo de Não Automatizar
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Descubra quanto dinheiro e tempo você está perdendo sem automação
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Dados da sua empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="monthly-pdfs">
                Quantos NFS-e você digita por mês?
              </Label>
              <Input
                id="monthly-pdfs"
                type="number"
                placeholder="Ex: 1.000"
                value={monthlyPdfs}
                onChange={(e) => setMonthlyPdfs(e.target.value)}
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employee-cost">
                Salário médio do colaborador (R$)
              </Label>
              <Input
                id="employee-cost"
                type="number"
                step="0.01"
                placeholder="Ex: 2.500,00"
                value={employeeCost}
                onChange={(e) => setEmployeeCost(e.target.value)}
                className="text-lg"
              />
            </div>

            <Button 
              onClick={handleCalculate}
              size="lg"
              className="w-full text-lg"
              disabled={!monthlyPdfs || !employeeCost}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calcular ROI
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Seus resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!results ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os campos ao lado para ver seus resultados</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tempo Economizado */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Tempo Economizado</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {results.timeSavedMonthly}h
                      </div>
                      <div className="text-muted-foreground">Por mês</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {results.timeSavedAnnual}h
                      </div>
                      <div className="text-muted-foreground">Por ano</div>
                    </div>
                  </div>
                </div>

                {/* Economia em Dinheiro */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Economia de Custos</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {results.costSavedMonthly}
                      </div>
                      <div className="text-muted-foreground">Por mês</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {results.costSavedAnnual}
                      </div>
                      <div className="text-muted-foreground">Por ano</div>
                    </div>
                  </div>
                </div>

                {/* ROI */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      {results.roi}%
                    </div>
                    <div className="font-semibold mb-1">ROI Anual</div>
                    <div className="text-sm text-muted-foreground">
                      Payback em {results.paybackMonths} meses
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button size="lg" className="w-full">
                    Começar Agora - Economize R$ {results.costSavedMonthly}/mês
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );    
};

export default ROICalculator;