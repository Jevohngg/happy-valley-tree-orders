import { useState } from 'react';
import { TreeConfigurator } from './components/TreeConfigurator';
import { StandStep, AddonsStep } from './components/MultiItemWizardSteps';
import { DeliveryStep, ScheduleStep, ContactStep } from './components/WizardSteps';
import { ReviewStep, ConfirmationScreen } from './components/ReviewAndConfirm';
import { UniversalFooter } from './components/UniversalFooter';

type Step =
  | 'tree'
  | 'stand'
  | 'delivery'
  | 'addons'
  | 'freshcut'
  | 'schedule'
  | 'contact'
  | 'review'
  | 'confirmation';

export interface TreeItem {
  speciesId: string;
  speciesName: string;
  fullness: 'thin' | 'medium' | 'full';
  height: number;
  pricePerFoot: number;
  unitPrice: number;
  quantity: number;
  freshCut: boolean;
  imageUrl: string;
}

export interface StandItem {
  id: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  hasOwn: boolean;
}

export interface WreathItem {
  id: string;
  size: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderData {
  trees: TreeItem[];
  stands: StandItem[];
  delivery: {
    id: string;
    name: string;
    fee: number;
  };
  wreaths: WreathItem[];
  schedule: {
    date: string | null;
    time: string | null;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
  };
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('tree');
  const [orderData, setOrderData] = useState<Partial<OrderData>>({
    trees: [],
    stands: [],
    wreaths: []
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewStepSubmit, setReviewStepSubmit] = useState<(() => void) | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const stepOrder: Step[] = ['tree', 'stand', 'delivery', 'addons', 'schedule', 'contact', 'review'];

  function goBack() {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }

  function goNext() {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }

  function handleReviewSubmit() {
    if (reviewStepSubmit) {
      reviewStepSubmit();
    }
  }

  function canGoNext(): boolean {
    switch (currentStep) {
      case 'tree':
        return (orderData.trees?.length || 0) > 0;
      case 'stand':
        return true;
      case 'delivery':
        return !!orderData.delivery;
      case 'addons':
        return true;
      case 'schedule':
        return true;
      case 'contact':
        return !!(orderData.contact?.firstName && orderData.contact?.lastName &&
                   orderData.contact?.email && orderData.contact?.phone &&
                   orderData.contact?.street && orderData.contact?.city &&
                   orderData.contact?.state && orderData.contact?.zip);
      case 'review':
        return true;
      default:
        return false;
    }
  }

  function getNextLabel(): string {
    switch (currentStep) {
      case 'review':
        return 'Confirm Order';
      default:
        return 'Next';
    }
  }

  return (
    <div>
      {currentStep === 'tree' && (
        <TreeConfigurator
          key={`tree-${refreshKey}`}
          existingTrees={orderData.trees || []}
          onUpdate={(trees) => setOrderData({ ...orderData, trees })}
        />
      )}

      {currentStep === 'stand' && (
        <StandStep
          key={`stand-${refreshKey}`}
          existingStands={orderData.stands || []}
          onUpdate={(stands) => setOrderData({ ...orderData, stands })}
        />
      )}

      {currentStep === 'delivery' && (
        <DeliveryStep
          key={`delivery-${refreshKey}`}
          selectedDelivery={orderData.delivery}
          onUpdate={(delivery) => setOrderData({ ...orderData, delivery })}
        />
      )}

      {currentStep === 'addons' && (
        <AddonsStep
          key={`addons-${refreshKey}`}
          existingWreaths={orderData.wreaths || []}
          onUpdate={(wreaths) => setOrderData({ ...orderData, wreaths })}
        />
      )}

      {currentStep === 'schedule' && (
        <ScheduleStep
          schedule={orderData.schedule}
          onUpdate={(schedule) => setOrderData({ ...orderData, schedule })}
        />
      )}

      {currentStep === 'contact' && (
        <ContactStep
          contact={orderData.contact}
          onUpdate={(contact) => setOrderData({ ...orderData, contact })}
        />
      )}

      {currentStep === 'review' && (
        <ReviewStep
          orderData={orderData as OrderData}
          onConfirm={(orderNum) => {
            setOrderNumber(orderNum);
            setCurrentStep('confirmation');
          }}
          onSubmitReady={(submitFn) => setReviewStepSubmit(() => submitFn)}
          onSubmittingChange={setIsSubmittingOrder}
        />
      )}

      {currentStep === 'confirmation' && orderData.trees && orderData.trees.length > 0 && orderData.delivery && orderData.schedule && orderData.contact && (
        <ConfirmationScreen
          orderNumber={orderNumber || 'Pending...'}
          orderData={orderData as OrderData}
        />
      )}

      {currentStep !== 'confirmation' && (
        <UniversalFooter
          orderData={orderData}
          canGoBack={stepOrder.indexOf(currentStep) > 0}
          canGoNext={canGoNext()}
          onBack={goBack}
          onNext={currentStep === 'review' ? handleReviewSubmit : goNext}
          nextLabel={getNextLabel()}
          isLoading={currentStep === 'review' && isSubmittingOrder}
        />
      )}
    </div>
  );
}

export default App;
