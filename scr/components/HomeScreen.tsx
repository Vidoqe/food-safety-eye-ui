                </span>
              )}
            </Button>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <Button
              onClick={onSettings}
              variant="outline"
              className="w-full h-16 border-green-300 text-green-700 hover:bg-green-50 text-lg font-semibold"
            >
              <Settings className="w-6 h-6 mr-3" />
              {language === 'zh' ? '設定' : 'Settings'}
            </Button>
          </Card>
        </div>

        {/* Plan Info */}
        {user && (
          <div className="mt-6 text-center">
            <p className="text-sm text-green-600">
              {language === 'zh' ? '當前方案：' : 'Current Plan: '}
              <span className="font-semibold">
                {user.subscriptionPlan === 'gold' ? (language === 'zh' ? '黃金' : 'Gold') :
                 user.subscriptionPlan === 'premium' ? (language === 'zh' ? '高級' : 'Premium') :
                 (language === 'zh' ? '免費' : 'Free')}
              </span>
              {!user.subscriptionActive && (
                <span className="text-red-500 ml-2">
                  ({language === 'zh' ? '已停用' : 'Inactive'})
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;